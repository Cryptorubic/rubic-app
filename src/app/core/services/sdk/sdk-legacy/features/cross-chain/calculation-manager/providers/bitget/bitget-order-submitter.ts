import { RubicError } from '@app/core/errors/models/rubic-error';
import { ERROR_TYPE } from '@app/core/errors/models/error-type';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { UserRejectError } from '@cryptorubic/web3';
import { BitgetAdditionalData, BitgetSignedOrder } from './models/bitget-order-tx';

const WALLET_REJECT_MESSAGES = ['reject', 'denied', 'declined', 'cancel'];

const UNSUPPORTED_METHOD_MESSAGES = [
  'not supported',
  'unsupported',
  'does not exist',
  'not available',
  'not implemented',
  'unknown method'
];

const UNSUPPORTED_METHOD_CODES = [4200, -32601];

function getErrorMessage(err: RubicAny): string {
  return String(typeof err === 'string' ? err : err?.message).toLowerCase();
}

function hasErrorCode(err: RubicAny, codes: number[]): boolean {
  return codes.includes(err?.code) || codes.includes(err?.cause?.code);
}

function isWalletRejectError(err: RubicAny): boolean {
  const message = getErrorMessage(err);
  return (
    hasErrorCode(err, [4001]) ||
    WALLET_REJECT_MESSAGES.some(rejectMessage => message.includes(rejectMessage))
  );
}

function isUnsupportedMethodError(err: RubicAny): boolean {
  const message = getErrorMessage(err);
  return (
    hasErrorCode(err, UNSUPPORTED_METHOD_CODES) ||
    UNSUPPORTED_METHOD_MESSAGES.some(unsupportedMessage => message.includes(unsupportedMessage))
  );
}

export function getBitgetAdditionalData(
  uniqueInfo: { additionalData?: { [key: string]: unknown } } | undefined
): BitgetAdditionalData {
  return (uniqueInfo?.additionalData ?? {}) as BitgetAdditionalData;
}

/**
 * Bitget cross-chain order: user signs txs without broadcasting, rubic-api passes them to Bitget.
 * Keeps an order from being signed twice: after a failed submit only submit is retried,
 * because txs are already signed with nonces assigned to this order.
 */
export class BitgetOrderSubmitter {
  private signedOrder: BitgetSignedOrder | null = null;

  private orderId: string | null = null;

  private isInProgress = false;

  constructor(private readonly rubicApiService: RubicApiService) {}

  /**
   * @returns Source tx hash
   */
  public async submit(
    prepareAndSign: () => Promise<{ orderId: string; signedOrder: BitgetSignedOrder }>
  ): Promise<{ orderId: string; srcHash: string }> {
    if (this.isInProgress) {
      throw new RubicError('The order is already being processed.');
    }
    this.isInProgress = true;

    try {
      if (!this.signedOrder || !this.orderId) {
        const { orderId, signedOrder } = await prepareAndSign();
        this.orderId = orderId;
        this.signedOrder = signedOrder;
      }

      await this.sendSignedTxs(this.orderId, this.signedOrder.signedTxs);

      return { orderId: this.orderId, srcHash: this.signedOrder.srcHash };
    } finally {
      this.isInProgress = false;
    }
  }

  public async requestSignature<T>(sign: () => Promise<T>): Promise<T> {
    try {
      return await sign();
    } catch (err) {
      if (isWalletRejectError(err)) {
        throw new UserRejectError();
      }
      if (isUnsupportedMethodError(err)) {
        console.error('Wallet failed to sign Bitget order tx', err);
        throw new RubicError('Your wallet is not supported by this provider.');
      }
      console.error(err);
      throw new RubicError(
        'Failed to sign the transaction. Your wallet may not support this swap.'
      );
    }
  }

  private async sendSignedTxs(orderId: string, signedTxs: string[]): Promise<void> {
    try {
      await this.rubicApiService.submitBitgetOrder(orderId, signedTxs);
    } catch (err: RubicAny) {
      const reason = this.getErrorReason(err);
      // 80015 — order is already submitted, e.g. retry after a lost response
      if (reason.includes('80015')) {
        return;
      }
      throw this.getSubmitError(err, reason);
    }
  }

  private getErrorReason(err: RubicAny): string {
    const body = err?.error;
    return String(body?.error?.reason ?? body?.error?.message ?? body?.message ?? '');
  }

  private getSubmitError(err: RubicAny, reason: string): RubicError<ERROR_TYPE> {
    const lowerReason = reason.toLowerCase();
    if (reason.includes('80004') || lowerReason.includes('expired')) {
      this.signedOrder = null;
      this.orderId = null;
      return new RubicError('The order has expired. Please request a new quote.');
    }

    console.error('Failed to submit Bitget order', err);
    return new RubicError('Failed to start the swap. Please try again.');
  }
}
