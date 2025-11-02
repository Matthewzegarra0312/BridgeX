import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import mysql from 'mysql2/promise';
import { z } from 'zod';
import {
  MySQLQueryRequestSchema,
  MySQLQueryResponseSchema,
  MySQLConfig,
  MySQLConnectionError,
  MySQLQueryError,
  type MySQLQueryRequest,
  type MySQLQueryResponse,
} from './mysql-types.js';
import { logger } from '../utils/logger.js';
import { retryWithExponentialBackoff } from '../utils/retry.js';

export class MySQLMCPServer {
  private server: McpServer;
  private pool: mysql.Pool | null = null;
  private config: MySQLConfig;

  constructor(config: MySQLConfig) {
    this.config = config;
    this.server = new McpServer({
      name: 'mcp-mysql-server',
      version: '1.0.0',
    });

    this.setupTools();
  }

  private setupTools(): void {
    // Registrar la herramienta para ejecutar consultas MySQL
    this.server.registerTool(
      'mysql_query',
      {
        title: 'Ejecutar Consulta MySQL',
        description: 'Ejecuta una consulta SQL en la base de datos MySQL con parámetros opcionales',
        inputSchema: MySQLQueryRequestSchema,
        outputSchema: MySQLQueryResponseSchema,
      },
      async (params: MySQLQueryRequest) => {
        return await this.executeQuery(params);
      }
    );

    // Herramienta para obtener esquema de la base de datos
    this.server.registerTool(
      'mysql_schema',
      {
        title: 'Obtener Esquema MySQL',
        description: 'Obtiene información del esquema de la base de datos (tablas, columnas)',
        inputSchema: z.object({
          table: z.string().optional(),
        }),
        outputSchema: z.object({
          tables: z.array(z.object({
            name: z.string(),
            columns: z.array(z.object({
              name: z.string(),
              type: z.string(),
              nullable: z.boolean(),
              key: z.string().optional(),
            })),
          })),
        }),
      },
      async (params: { table?: string }) => {
        return await this.getSchema(params.table);
      }
    );

    // Herramienta para verificar conexión
    this.server.registerTool(
      'mysql_ping',
      {
        title: 'Verificar Conexión MySQL',
        description: 'Verifica si la conexión a MySQL está activa',
        inputSchema: z.object({}),
        outputSchema: z.object({
          connected: z.boolean(),
          message: z.string(),
          responseTime: z.number().optional(),
        }),
      },
      async () => {
        return await this.ping();
      }
    );
  }

  private async executeQuery(request: MySQLQueryRequest): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    structuredContent: MySQLQueryResponse;
  }> {
    const startTime = Date.now();
    
    try {
      await this.ensureConnection();
      
      const { sql, params = {} } = request;
      logger.info('Executing MySQL query', { sql, params });

      // Reemplazar parámetros nombrados en la consulta SQL
      let processedSql = sql;
      const values: any[] = [];

      // Convertir parámetros nombrados (:param) a marcadores de posición (?)
      const paramRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;
      processedSql = processedSql.replace(paramRegex, (match: string, paramName: string) => {
        if (params[paramName] !== undefined) {
          values.push(params[paramName]);
          return '?';
        }
        return match;
      });

      const [rows, fields] = await retryWithExponentialBackoff(
        async () => {
          if (!this.pool) {
            throw new MySQLConnectionError('No hay conexión disponible');
          }
          return await this.pool.execute(processedSql, values);
        },
        3,
        1000
      );

      const executionTime = Date.now() - startTime;

      // Procesar resultados
      let columns: string[] = [];
      let resultRows: any[][] = [];

      if (Array.isArray(rows)) {
        // SELECT query
        if (rows.length > 0 && fields) {
          columns = fields.map((field: any) => field.name);
          resultRows = rows.map((row: any) => 
            columns.map(col => row[col])
          );
        }
      } else {
        // INSERT/UPDATE/DELETE query
        const result = rows as mysql.ResultSetHeader;
        columns = ['affectedRows', 'insertId'];
        resultRows = [[result.affectedRows, result.insertId || null]];
      }

      const response: MySQLQueryResponse = {
        columns,
        rows: resultRows,
        rowCount: resultRows.length,
        executionTime,
      };

      logger.info('MySQL query executed successfully', {
        rowCount: response.rowCount,
        executionTime,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response, null, 2),
          },
        ],
        structuredContent: response,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('MySQL query failed', { sql: request.sql, error, executionTime });

      if (error instanceof Error) {
        throw new MySQLQueryError(error.message, request.sql, error);
      }
      throw new MySQLQueryError('Unknown error occurred', request.sql);
    }
  }

  private async getSchema(tableName?: string): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    structuredContent: any;
  }> {
    try {
      await this.ensureConnection();

      let query = `
        SELECT 
          t.TABLE_NAME as table_name,
          c.COLUMN_NAME as column_name,
          c.DATA_TYPE as data_type,
          c.IS_NULLABLE as is_nullable,
          c.COLUMN_KEY as column_key
        FROM 
          INFORMATION_SCHEMA.TABLES t
          JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
        WHERE 
          t.TABLE_SCHEMA = DATABASE()
      `;

      const params: any[] = [];
      if (tableName) {
        query += ' AND t.TABLE_NAME = ?';
        params.push(tableName);
      }

      query += ' ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION';

      if (!this.pool) {
        throw new MySQLConnectionError('No hay conexión disponible');
      }

      const [rows] = await this.pool.execute(query, params);
      const schemaRows = rows as any[];

      // Agrupar por tabla
      const tables = new Map<string, any>();
      
      schemaRows.forEach((row: any) => {
        if (!tables.has(row.table_name)) {
          tables.set(row.table_name, {
            name: row.table_name,
            columns: [],
          });
        }

        tables.get(row.table_name)!.columns.push({
          name: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES',
          key: row.column_key || undefined,
        });
      });

      const result = {
        tables: Array.from(tables.values()),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    } catch (error) {
      logger.error('Failed to get MySQL schema', { error });
      throw error;
    }
  }

  private async ping(): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    structuredContent: any;
  }> {
    const startTime = Date.now();

    try {
      await this.ensureConnection();
      
      if (!this.pool) {
        throw new MySQLConnectionError('No hay conexión disponible');
      }

      await this.pool.execute('SELECT 1');
      const responseTime = Date.now() - startTime;

      const result = {
        connected: true,
        message: 'Conexión MySQL activa',
        responseTime,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('MySQL ping failed', { error, responseTime });

      const result = {
        connected: false,
        message: `Conexión falló: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        responseTime,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
        structuredContent: result,
      };
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.pool) {
      await this.connect();
    }
  }

  async connect(): Promise<void> {
    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        ssl: this.config.ssl,
        connectionLimit: this.config.connectionLimit,
        acquireTimeout: this.config.acquireTimeout,
        timeout: this.config.timeout,
        // Configuraciones adicionales para estabilidad
        reconnect: true,
        idleTimeout: 300000, // 5 minutos
        maxIdle: 5,
      });

      // Verificar conexión
      await this.pool.execute('SELECT 1');
      logger.info('MySQL connection pool created successfully', {
        host: this.config.host,
        database: this.config.database,
      });
    } catch (error) {
      logger.error('Failed to create MySQL connection pool', { error });
      logger.info('⚠️  WARNING: MySQL not available. Backend will start but database features will not work.', {
        error: error instanceof Error ? error.message : 'Connection refused'
      });
      // No lanzar excepción - permitir que el backend inicie
      // throw new MySQLConnectionError(...);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      logger.info('MySQL connection pool closed');
    }
  }

  getMCPServer(): McpServer {
    return this.server;
  }

  async handleRequest(transport: StreamableHTTPServerTransport): Promise<void> {
    await this.server.connect(transport);
  }
}