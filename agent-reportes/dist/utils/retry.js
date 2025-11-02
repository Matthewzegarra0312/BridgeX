/**
 * Utilidad para reintentar operaciones con backoff exponencial
 */
export class RetryError extends Error {
    attempts;
    lastError;
    constructor(message, attempts, lastError) {
        super(message);
        this.attempts = attempts;
        this.lastError = lastError;
        this.name = 'RetryError';
    }
}
/**
 * Ejecuta una función con reintentos y backoff exponencial
 * @param operation Función a ejecutar
 * @param maxRetries Número máximo de reintentos
 * @param baseDelay Retraso base en millisegundos
 * @param options Opciones adicionales de reintento
 */
export async function retryWithExponentialBackoff(operation, maxRetries = 3, baseDelay = 1000, options) {
    const { maxDelay = 30000, backoffFactor = 2, jitter = true, } = options || {};
    let lastError = null;
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            attempt++;
            if (attempt > maxRetries) {
                break;
            }
            // Calcular retraso con backoff exponencial
            let delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
            // Agregar jitter para evitar el "thundering herd problem"
            if (jitter) {
                delay = delay * (0.5 + Math.random() * 0.5);
            }
            console.log(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms`);
            await sleep(delay);
        }
    }
    throw new RetryError(`Operation failed after ${attempt} attempts`, attempt, lastError);
}
/**
 * Versión simplificada para casos comunes
 */
export async function retry(operation, retries = 3) {
    return retryWithExponentialBackoff(operation, retries, 1000);
}
/**
 * Helper para pausar la ejecución
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Reintenta operaciones que pueden fallar por problemas de red/conexión
 */
export async function retryNetworkOperation(operation, maxRetries = 5) {
    return retryWithExponentialBackoff(operation, maxRetries, 1000, {
        maxDelay: 60000,
        backoffFactor: 2,
        jitter: true,
    });
}
/**
 * Wrapper para operaciones de base de datos
 */
export async function retryDBOperation(operation, maxRetries = 3) {
    return retryWithExponentialBackoff(operation, maxRetries, 500, {
        maxDelay: 10000,
        backoffFactor: 2,
        jitter: true,
    });
}
//# sourceMappingURL=retry.js.map