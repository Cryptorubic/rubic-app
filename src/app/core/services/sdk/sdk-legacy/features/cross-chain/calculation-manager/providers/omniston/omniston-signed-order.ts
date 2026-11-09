import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicApiService } from '@app/core/services/sdk/sdk-legacy/rubic-api/rubic-api.service';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { UserRejectError } from '@cryptorubic/web3';
import { OmnistonSignedOrderTransaction, OmnistonTypedData } from './models/omniston-typed-data';

const WALLET_REJECT_MESSAGES = ['reject', 'denied', 'declined', 'cancel'];

function isWalletRejectError(err: RubicAny): boolean {
  const message = String(typeof err === 'string' ? err : err?.message).toLowerCase();

  return (
    err?.code === 4001 ||
    err?.cause?.code === 4001 ||
    WALLET_REJECT_MESSAGES.some(rejectMessage => message.includes(rejectMessage))
  );
}

export function getOmnistonTypedData(
  transaction: OmnistonSignedOrderTransaction
): OmnistonTypedData {
  if (!transaction.typedData) {
    throw new RubicError('Omniston did not return an order to sign. Please request a new quote.');
  }
  return transaction.typedData;
}

/**
 * Keeps a single order from being prepared or signed twice.
 * Repeated /routes/swap overwrites the order secret on backend, so already signed order would end up with refund.
 */
export class OmnistonSignedOrder {
  private signature: string | null = null;

  private isInProgress = false;

  constructor(private readonly rubicApiService: RubicApiService) {}

  public async submit(
    prepareAndSign: () => Promise<string>,
    getRubicId: () => string
  ): Promise<string> {
    if (this.isInProgress) {
      throw new RubicError('The order is already being processed.');
    }
    this.isInProgress = true;

    try {
      if (!this.signature) {
        this.signature = await prepareAndSign();
      }
      const { exchangeId } = await this.rubicApiService.registerOmnistonOrder(
        getRubicId(),
        this.signature
      );
      return exchangeId;
    } finally {
      this.isInProgress = false;
    }
  }

  public async requestSignature(sign: () => Promise<string>): Promise<string> {
    try {
      return await sign();
    } catch (err) {
      if (isWalletRejectError(err)) {
        throw new UserRejectError();
      }
      console.error(err);
      throw new RubicError('Failed to sign the order. Your wallet may not support this swap.');
    }
  }
}
