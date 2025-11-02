/**
 * Utilidad para reintentar operaciones con backoff exponencial
 */
export interface RetryOptions {
    maxRetries: number;
    baseDelay: number;
    maxDelay?: number;
    backoffFactor?: number;
    jitter?: boolean;
}
export declare class RetryError extends Error {
    attempts: number;
    lastError: Error;
    constructor(message: string, attempts: number, lastError: Error);
}
/**
 * Ejecuta una función con reintentos y backoff exponencial
 * @param operation Función a ejecutar
 * @param maxRetries Número máximo de reintentos
 * @param baseDelay Retraso base en millisegundos
 * @param options Opciones adicionales de reintento
 */
export declare function retryWithExponentialBackoff<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number, options?: Partial<RetryOptions>): Promise<T>;
/**
 * Versión simplificada para casos comunes
 */
export declare function retry<T>(operation: () => Promise<T>, retries?: number): Promise<T>;
/**
 * Helper para pausar la ejecución
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Reintenta operaciones que pueden fallar por problemas de red/conexión
 */
export declare function retryNetworkOperation<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
/**
 * Wrapper para operaciones de base de datos
 */
export declare function retryDBOperation<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>;
//# sourceMappingURL=retry.d.ts.map