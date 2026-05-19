import { waitFor } from '@cryptorubic/web3';

/**
 * don't use like
 * const callback = withRetry(asyncCall, 2, {})
 * callback()
 * ...
 * // somewhere else in code
 * callback()
 * // it returns you previous resolved/rejected promise
 * // and doesn't make retries cause retryCount already incremented in previous call
 */
export async function withRetry<T>(
  promiseCallback: () => Promise<T>,
  maxRetriesCount: number,
  defaultResponse?: T,
  retryDelay: number = 1_000
): Promise<T> {
  let retryCount = 0;

  const callRecursively = async (): Promise<T> => {
    try {
      const resp = await promiseCallback();
      return resp;
    } catch (err) {
      if (maxRetriesCount > retryCount) {
        retryCount++;
        await waitFor(retryDelay);
        return callRecursively();
      }
      if (defaultResponse) return defaultResponse;
      throw err;
    }
  };

  return callRecursively();
}

/**
 *
 * @param promiseCallback any promise function
 * @param conditionToRetry if returns true - promise retries, if returns false - returns promise response
 * @param maxRetriesCount if limit of retries reached - the last resolved result will return ignoring condition
 * @param retryDelay delay in milliseconds
 * @returns resolved response of promiseCallback
 */
export async function withRetryWhile<T>(
  promiseCallback: () => Promise<T>,
  conditionToRetry: (promiseResponse: T) => boolean,
  maxRetriesCount: number = Infinity,
  retryDelay: number = 1_000
): Promise<T> {
  let retryCount = 0;

  const callRecursively = async (): Promise<T> => {
    try {
      const result = await promiseCallback();
      const needRetry = conditionToRetry(result);

      if (needRetry && maxRetriesCount > retryCount) {
        retryCount++;
        await waitFor(retryDelay);
        return callRecursively();
      }

      return result;
    } catch (err) {
      if (maxRetriesCount > retryCount) {
        retryCount++;
        await waitFor(retryDelay);
        return callRecursively();
      }

      throw err;
    }
  };

  return callRecursively();
}
