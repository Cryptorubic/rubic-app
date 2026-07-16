import { Xumm } from 'xumm';
import { RippleWallet } from '@cryptorubic/web3';
import { XamanSignService } from '../services/xaman-sign.service';
import { WrongWalletSelectedError } from '@app/core/errors/models/provider/wrong-wallet-selected-error';

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

interface XamanPayloadResult {
  signed: boolean;
  txid?: string;
  account?: string;
  hex?: string;
}

interface XamanPayloadEvent {
  data?: {
    signed?: boolean;
    expired?: boolean;
    [key: string]: unknown;
  };
  payload?: {
    response?: {
      txid?: string;
      account?: string | null;
      hex?: string | null;
    };
  };
}

interface XamanManualSubmissionOptions {
  expectedAccount: string;
  /**
   * When true, warning refers to the receiver wallet; otherwise to the connected wallet.
   */
  isReceiverAccount: boolean;
  submitSignedBlob: (blob: string) => Promise<string>;
}

function buildTrustlineSignInstruction(options: XamanManualSubmissionOptions): {
  walletInstruction: string;
  modalWarning: string;
} {
  const accountLabel = options.isReceiverAccount ? 'receiver' : 'connected';
  return {
    walletInstruction: `Sign with the ${accountLabel} wallet: ${options.expectedAccount}`,
    modalWarning: `Sign with the ${accountLabel} wallet: <b class="text-nowrap">${options.expectedAccount}</b>`
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
export function toRippleWalletCore(
  xumm: Xumm,
  signService: XamanSignService,
  manualSubmission?: XamanManualSubmissionOptions
): RippleWallet {
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
            txid: event?.payload?.response?.txid,
            account: event?.payload?.response?.account ?? undefined,
            hex: event?.payload?.response?.hex ?? undefined
          };
        };

        const payloadRequest = manualSubmission
          ? {
              txjson,
              options: {
                submit: false,
                force_network: 'MAINNET'
              },
              custom_meta: {
                instruction: buildTrustlineSignInstruction(manualSubmission).walletInstruction
              }
            }
          : txjson;

        const subscription = (await payload.createAndSubscribe(
          payloadRequest as Parameters<typeof payload.createAndSubscribe>[0],
          onPayloadEvent as Parameters<typeof payload.createAndSubscribe>[1]
        )) as unknown as XamanCreatedSubscription;

        const modalRef = signService.openSignRequest({
          qrCodeUrl: subscription.created.refs.qr_png,
          deepLink: subscription.created.next.always,
          warningText: manualSubmission?.isReceiverAccount
            ? buildTrustlineSignInstruction(manualSubmission).modalWarning
            : undefined
        });

        void modalRef.dismissed.then(() => subscription.resolve({ signed: false }));
        void Promise.resolve(subscription.resolved).finally(() => modalRef.close());

        if (!manualSubmission) {
          return subscription as unknown as ReturnType<
            RippleWallet['payload']['createAndSubscribe']
          >;
        }

        const resolved = Promise.resolve(subscription.resolved).then(async rawResult => {
          const result = rawResult as XamanPayloadResult;

          if (!result.signed) {
            return result;
          }

          if (result.account !== manualSubmission.expectedAccount) {
            throw new WrongWalletSelectedError(manualSubmission.expectedAccount);
          }

          if (!result.hex) {
            throw new Error('Xaman did not return a signed transaction.');
          }

          return {
            signed: true,
            txid: await manualSubmission.submitSignedBlob(result.hex)
          };
        });

        return {
          ...subscription,
          resolved
        } as unknown as ReturnType<RippleWallet['payload']['createAndSubscribe']>;
      }
    },
    user: xumm.user
  };
}
