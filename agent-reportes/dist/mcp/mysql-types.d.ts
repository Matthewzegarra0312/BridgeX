import { z } from 'zod';
export declare const MySQLQueryRequestSchema: z.ZodObject<{
    sql: z.ZodString;
    params: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    sql: string;
    params: Record<string, any>;
}, {
    sql: string;
    params?: Record<string, any> | undefined;
}>;
export declare const MySQLQueryResponseSchema: z.ZodObject<{
    columns: z.ZodArray<z.ZodString, "many">;
    rows: z.ZodArray<z.ZodArray<z.ZodAny, "many">, "many">;
    rowCount: z.ZodNumber;
    executionTime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    columns: string[];
    rows: any[][];
    rowCount: number;
    executionTime?: number | undefined;
}, {
    columns: string[];
    rows: any[][];
    rowCount: number;
    executionTime?: number | undefined;
}>;
export type MySQLQueryRequest = z.infer<typeof MySQLQueryRequestSchema>;
export type MySQLQueryResponse = z.infer<typeof MySQLQueryResponseSchema>;
export declare const MySQLConfigSchema: z.ZodObject<{
    host: z.ZodString;
    port: z.ZodDefault<z.ZodNumber>;
    database: z.ZodString;
    user: z.ZodString;
    password: z.ZodString;
    ssl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    connectionLimit: z.ZodDefault<z.ZodNumber>;
    acquireTimeout: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl: boolean;
    connectionLimit: number;
    acquireTimeout: number;
    timeout: number;
}, {
    host: string;
    database: string;
    user: string;
    password: string;
    port?: number | undefined;
    ssl?: boolean | undefined;
    connectionLimit?: number | undefined;
    acquireTimeout?: number | undefined;
    timeout?: number | undefined;
}>;
export type MySQLConfig = z.infer<typeof MySQLConfigSchema>;
export declare class MySQLError extends Error {
    code?: string | undefined;
    errno?: number | undefined;
    sqlState?: string | undefined;
    constructor(message: string, code?: string | undefined, errno?: number | undefined, sqlState?: string | undefined);
}
export declare class MySQLConnectionError extends MySQLError {
    constructor(message: string, originalError?: Error);
}
export declare class MySQLQueryError extends MySQLError {
    query: string;
    constructor(message: string, query: string, originalError?: Error);
}
//# sourceMappingURL=mysql-types.d.ts.map