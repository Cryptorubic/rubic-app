import { RailgunResponse } from '@features/privacy/providers/railgun/services/worker/models';

export function postWorkerMessage<T>(message: RailgunResponse<T>): void {
  if (typeof self !== 'undefined' && typeof self.postMessage === 'function') {
    self.postMessage(message);
  } else {
    console.warn('Unable to post message: postMessage is not available in this context.');
  }
}
