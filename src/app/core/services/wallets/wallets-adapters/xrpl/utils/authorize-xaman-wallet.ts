import { NgZone } from '@angular/core';
import { Xumm } from 'xumm';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { isXamanMobileDevice } from './is-xaman-mobile-device';

/**
 * Runs Xaman OAuth authorization. On mobile the origin browser tab stays open and the SDK resolves
 * the session over WebSocket once the user confirms in Xaman and returns to the same tab.
 */
export async function authorizeXamanWallet(
  xumm: Xumm,
  window: RubicWindow,
  zone: NgZone
): Promise<void> {
  if (!isXamanMobileDevice(window.navigator.userAgent)) {
    const authorizeResult = await xumm.authorize();

    if (authorizeResult instanceof Error) {
      throw authorizeResult;
    }

    return;
  }

  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const finish = (action: () => void): void => {
      if (settled) {
        return;
      }

      settled = true;
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      cleanup();
      zone.run(action);
    };

    const tryResolveSignedIn = (): void => {
      if (xumm.state.signedIn) {
        finish(() => resolve());
      }
    };

    const onSuccess = (): void => tryResolveSignedIn();
    const onRetrieved = (): void => tryResolveSignedIn();
    const onError = (err: unknown): void => finish(() => reject(err));
    const onVisibility = (): void => {
      if (window.document.visibilityState === 'visible') {
        tryResolveSignedIn();
      }
    };

    const cleanup = (): void => {
      xumm.off('success', onSuccess);
      xumm.off('retrieved', onRetrieved);
      xumm.off('error', onError);
      window.document.removeEventListener('visibilitychange', onVisibility);
    };

    xumm.on('success', onSuccess);
    xumm.on('retrieved', onRetrieved);
    xumm.on('error', onError);
    window.document.addEventListener('visibilitychange', onVisibility);

    void xumm.authorize().then(result => {
      if (result instanceof Error) {
        finish(() => reject(result));
        return;
      }

      tryResolveSignedIn();
    });
  });
}
