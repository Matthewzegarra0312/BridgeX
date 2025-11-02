import { retryWithExponentialBackoff, retry, RetryError } from '../src/utils/retry.js';

describe('Retry utilities', () => {
  describe('retryWithExponentialBackoff', () => {
    test('should succeed on first attempt', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');

      const result = await retryWithExponentialBackoff(mockOperation, 3, 100);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');

      const result = await retryWithExponentialBackoff(mockOperation, 3, 10);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retries', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent failure'));

      await expect(
        retryWithExponentialBackoff(mockOperation, 2, 10)
      ).rejects.toThrow(RetryError);

      expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    test('should respect custom backoff options', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retryWithExponentialBackoff(mockOperation, 1, 50, {
        backoffFactor: 2,
        jitter: false,
      });
      const endTime = Date.now();

      expect(mockOperation).toHaveBeenCalledTimes(2);
      // Should have waited at least 50ms
      expect(endTime - startTime).toBeGreaterThanOrEqual(45);
    });
  });

  describe('retry (simplified)', () => {
    test('should use default parameters', async () => {
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('Failure'))
        .mockResolvedValue('success');

      const result = await retry(mockOperation);

      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalledTimes(2);
    });
  });

  describe('RetryError', () => {
    test('should contain attempt count and last error', async () => {
      const originalError = new Error('Original error');
      const mockOperation = jest.fn().mockRejectedValue(originalError);

      try {
        await retryWithExponentialBackoff(mockOperation, 2, 10);
      } catch (error) {
        expect(error).toBeInstanceOf(RetryError);
        if (error instanceof RetryError) {
          expect(error.attempts).toBe(3);
          expect(error.lastError).toBe(originalError);
          expect(error.message).toContain('Operation failed after 3 attempts');
        }
      }
    });
  });
});

// Mock setTimeout para acelerar las pruebas
jest.useFakeTimers();

describe('Retry with fake timers', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  test('should respect delay timing', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');

    const retryPromise = retryWithExponentialBackoff(mockOperation, 1, 1000, {
      jitter: false,
    });

    // Fast-forward time
    jest.advanceTimersByTime(1000);

    const result = await retryPromise;
    expect(result).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
  });
});