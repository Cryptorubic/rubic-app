import { Xumm } from 'xumm';
import { RippleWallet } from '@cryptorubic/web3';
import { XamanSignService } from '../services/xaman-sign.service';

/**
 * Minimal shape of the xumm-sdk `createAndSubscribe` result that this adapter relies on.
 */
interface XamanCreatedSubscription {
  created: {
    refs: { qr_png: string };
    next: { always: string };
  };
  resolved?: Promise<unknown>;
  resolve: (resolveData?: unknown) => void;
}

interface XamanPayloadEvent {
  data?: {
    signed?: boolean;
    expired?: boolean;
    [key: string]: unknown;
  };
  payload?: {
    response?: { txid?: string };
  };
}

/**
 * The universal Xumm SDK exposes `payload`/`user` through an internal Proxy that only forwards a
 * method call when `obj.constructor.name === 'Promise'`. Under Angular, zone.js replaces the global
 * Promise with `ZoneAwarePromise` (its `Symbol.toStringTag` is `'Promise'`, but `constructor.name`
 * stays `'ZoneAwarePromise'`), so the check fails and `xumm.payload.createAndSubscribe` resolves to
 * `undefined`. Awaiting `xumm.payload` resolves the proxy down to the underlying xumm-sdk payload
 * instance, whose real methods can be invoked directly without hitting the broken proxy branch.
 *
 * The xumm-sdk subscription also only resolves its `resolved` promise when the callback returns a
 * non-undefined value, so the callback here resolves it on a signed/expired event and surfaces the
 * tx hash expected by the RippleAdapterSigner. The QR sign request is presented via an in-app modal
 * that is closed once the payload settles (or cancels the request when dismissed).
 */
export function toRippleWalletCore(xumm: Xumm, signService: XamanSignService): RippleWallet {
  return {
    payload: {
      createAndSubscribe: async txjson => {
        const payload = await xumm.payload;

        if (!payload) {
          throw new Error('Xaman payload API is unavailable.');
        }

        const onPayloadEvent = (event: XamanPayloadEvent): unknown => {
          const data = event?.data ?? {};
          const isResolved = data.signed !== undefined || Boolean(data.expired);

          if (!isResolved) {
            return undefined;
          }

          return {
            signed: Boolean(data.signed),
            txid: event?.payload?.response?.txid
          };
        };

        const subscription = (await payload.createAndSubscribe(
          txjson as Parameters<typeof payload.createAndSubscribe>[0],
          onPayloadEvent as Parameters<typeof payload.createAndSubscribe>[1]
        )) as unknown as XamanCreatedSubscription;

        const modalRef = signService.openSignRequest({
          qrCodeUrl: subscription.created.refs.qr_png,
          deepLink: subscription.created.next.always
        });

        void modalRef.dismissed.then(() => subscription.resolve({ signed: false }));
        void Promise.resolve(subscription.resolved).finally(() => modalRef.close());

        return subscription as unknown as ReturnType<RippleWallet['payload']['createAndSubscribe']>;
      }
    },
    user: xumm.user
  };
}
