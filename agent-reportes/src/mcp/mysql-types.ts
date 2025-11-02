import { z } from 'zod';

// Esquemas de validación para MySQL MCP
export const MySQLQueryRequestSchema = z.object({
  sql: z.string().min(1, 'SQL query cannot be empty'),
  params: z.record(z.any()).optional().default({}),
});

export const MySQLQueryResponseSchema = z.object({
  columns: z.array(z.string()),
  rows: z.array(z.array(z.any())),
  rowCount: z.number(),
  executionTime: z.number().optional(),
});

// Tipos TypeScript
export type MySQLQueryRequest = z.infer<typeof MySQLQueryRequestSchema>;
export type MySQLQueryResponse = z.infer<typeof MySQLQueryResponseSchema>;

// Configuración de conexión MySQL
export const MySQLConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().min(1).max(65535).default(3306),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string(),
  ssl: z.boolean().optional().default(false),
  connectionLimit: z.number().min(1).max(100).default(10),
  acquireTimeout: z.number().min(1000).default(60000),
  timeout: z.number().min(1000).default(30000),
});

export type MySQLConfig = z.infer<typeof MySQLConfigSchema>;

// Errores específicos de MySQL
export class MySQLError extends Error {
  constructor(
    message: string,
    public code?: string,
    public errno?: number,
    public sqlState?: string
  ) {
    super(message);
    this.name = 'MySQLError';
  }
}

export class MySQLConnectionError extends MySQLError {
  constructor(message: string, originalError?: Error) {
    super(`Connection failed: ${message}`);
    this.name = 'MySQLConnectionError';
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}

export class MySQLQueryError extends MySQLError {
  constructor(
    message: string,
    public query: string,
    originalError?: Error
  ) {
    super(`Query failed: ${message}`);
    this.name = 'MySQLQueryError';
    if (originalError && originalError.stack) {
      this.stack = originalError.stack;
    }
  }
}