import { TimeoutError } from '@cryptorubic/web3';

export interface ClearablePromise<T> extends Promise<T> {
  clear: () => void;
}

export type PTimeoutOptions = {
  readonly customTimers?: {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
  };
};

type CancelablePromise<T> = Promise<T> & { cancel: () => void };

function isCancelablePromise<T>(promise: PromiseLike<T>): promise is CancelablePromise<T> {
  return (
    'cancel' in promise &&
    typeof (promise as Promise<T> & { cancel: unknown }).cancel === 'function'
  );
}

export default function pTimeout<ValueType>(
  promise: PromiseLike<ValueType>,
  milliseconds: number,
  message?: string | Error,
  options?: PTimeoutOptions
): ClearablePromise<ValueType>;
export default function pTimeout<ValueType, FallbackReturnType>(
  promise: PromiseLike<ValueType>,
  milliseconds: number,
  fallback?: () => FallbackReturnType | Promise<FallbackReturnType>,
  options?: PTimeoutOptions
): ClearablePromise<ValueType | FallbackReturnType>;
export default function pTimeout<ValueType, FallbackReturnType = never>(
  promise: PromiseLike<ValueType>,
  milliseconds: number,
  fallback?: FallbackReturnType extends never
    ? string | Error
    : () => FallbackReturnType | Promise<FallbackReturnType>,
  options?: PTimeoutOptions
): ClearablePromise<FallbackReturnType extends never ? ValueType : ValueType | FallbackReturnType> {
  let timer: NodeJS.Timeout;
  const clearablePromise: ClearablePromise<unknown> = new Promise((resolve, reject) => {
    if (Math.sign(milliseconds) !== 1) {
      throw new TypeError(
        `Expected \`milliseconds\` to be a positive number, got \`${milliseconds}\``
      );
    }

    if (milliseconds === Number.POSITIVE_INFINITY) {
      resolve(promise);
      return;
    }

    options = {
      customTimers: { setTimeout, clearTimeout },
      ...options
    };

    timer = options.customTimers!.setTimeout.call(
      undefined,
      () => {
        if (typeof fallback === 'function') {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }

          return;
        }

        const message =
          typeof fallback === 'string'
            ? fallback
            : `Promise timed out after ${milliseconds} milliseconds`;
        const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);

        if (isCancelablePromise(promise)) {
          promise.cancel();
        }

        reject(timeoutError);
      },
      milliseconds
    );

    (async () => {
      try {
        resolve(await promise);
      } catch (error) {
        reject(error);
      } finally {
        options.customTimers!.clearTimeout.call(undefined, timer);
      }
    })();
  }) as ClearablePromise<unknown>;

  clearablePromise.clear = () => {
    clearTimeout(timer);
    timer = undefined as unknown as NodeJS.Timeout;
  };

  return clearablePromise as ClearablePromise<
    FallbackReturnType extends never ? ValueType : ValueType | FallbackReturnType
  >;
}
