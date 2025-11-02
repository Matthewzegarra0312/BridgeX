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
// Errores específicos de MySQL
export class MySQLError extends Error {
    code;
    errno;
    sqlState;
    constructor(message, code, errno, sqlState) {
        super(message);
        this.code = code;
        this.errno = errno;
        this.sqlState = sqlState;
        this.name = 'MySQLError';
    }
}
export class MySQLConnectionError extends MySQLError {
    constructor(message, originalError) {
        super(`Connection failed: ${message}`);
        this.name = 'MySQLConnectionError';
        if (originalError && originalError.stack) {
            this.stack = originalError.stack;
        }
    }
}
export class MySQLQueryError extends MySQLError {
    query;
    constructor(message, query, originalError) {
        super(`Query failed: ${message}`);
        this.query = query;
        this.name = 'MySQLQueryError';
        if (originalError && originalError.stack) {
            this.stack = originalError.stack;
        }
    }
}
//# sourceMappingURL=mysql-types.js.map