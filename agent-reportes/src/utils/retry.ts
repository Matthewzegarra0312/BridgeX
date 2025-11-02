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

export class RetryError extends Error {
  constructor(
    message: string,
    public attempts: number,
    public lastError: Error
  ) {
    super(message);
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
export async function retryWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  options?: Partial<RetryOptions>
): Promise<T> {
  const {
    maxDelay = 30000,
    backoffFactor = 2,
    jitter = true,
  } = options || {};

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (error) {
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

  throw new RetryError(
    `Operation failed after ${attempt} attempts`,
    attempt,
    lastError!
  );
}

/**
 * Versión simplificada para casos comunes
 */
export async function retry<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  return retryWithExponentialBackoff(operation, retries, 1000);
}

/**
 * Helper para pausar la ejecución
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Reintenta operaciones que pueden fallar por problemas de red/conexión
 */
export async function retryNetworkOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5
): Promise<T> {
  return retryWithExponentialBackoff(
    operation,
    maxRetries,
    1000,
    {
      maxDelay: 60000,
      backoffFactor: 2,
      jitter: true,
    }
  );
}

/**
 * Wrapper para operaciones de base de datos
 */
export async function retryDBOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  return retryWithExponentialBackoff(
    operation,
    maxRetries,
    500,
    {
      maxDelay: 10000,
      backoffFactor: 2,
      jitter: true,
    }
  );
}