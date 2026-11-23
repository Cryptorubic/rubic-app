import { VersionedTransaction } from '@solana/web3.js';
import { parseError, TooLowAmountError } from '@cryptorubic/web3';
import bs58 from 'bs58';
import { hexToBytes } from 'viem';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import { SolanaApiCrossChainTrade } from '../../../../ws-api/chains/solana/solana-api-cross-chain-trade';
import { BitgetSignedOrder } from './models/bitget-order-tx';
import { BitgetOrderSubmitter, getBitgetAdditionalData } from './bitget-order-submitter';

/**
 * Bitget Order mode: tx is signed by user without broadcasting and sent to Bitget through rubic-api.
 * Blockhash and compute budget are set by Bitget and must not be changed.
 */
export class BitgetSolanaCrossChainTrade extends SolanaApiCrossChainTrade {
  private readonly order = new BitgetOrderSubmitter(this.rubicApiService);

  public override async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    this.checkWalletConnected();

    try {
      const { orderId, srcHash } = await this.order.submit(() => this.prepareAndSign(options));

      this._exchangeId = orderId;
      options.onConfirm?.(srcHash);

      return srcHash;
    } catch (err) {
      if (err instanceof RubicError) {
        throw err;
      }
      if (err?.error?.errorId === 'ERROR_LOW_GIVE_AMOUNT') {
        throw new TooLowAmountError();
      }
      throw parseError(err);
    }
  }

  private async prepareAndSign(
    options: SwapTransactionOptions
  ): Promise<{ orderId: string; signedOrder: BitgetSignedOrder }> {
    const { data, warnings } = await this.setTransactionConfig(
      false,
      options?.useCacheData || false,
      options.testMode,
      options?.receiverAddress
    );

    if (options.onWarning && warnings?.length) {
      options.onWarning(warnings);
    }

    const swapResponse = this.lastSwapResponse;
    const orderId =
      (swapResponse?.transaction as { exchangeId?: string } | undefined)?.exchangeId ||
      getBitgetAdditionalData(swapResponse?.uniqueInfo).bitgetOrderId;
    if (!data || !orderId) {
      throw new RubicError('Bitget did not return an order to sign. Please request a new quote.');
    }

    const tx = VersionedTransaction.deserialize(this.decodeTxData(data));

    const signedTx = await this.order.requestSignature(() =>
      this.chainAdapter.signer.wallet.signTransaction(tx)
    );

    const signature = signedTx.signatures[0];
    if (!signature) {
      throw new RubicError('Failed to sign the transaction. Please try again.');
    }

    return {
      orderId,
      signedOrder: {
        // Order is requested with v0 tx, Bitget expects base58 without 0x for it
        signedTxs: [bs58.encode(signedTx.serialize())],
        srcHash: bs58.encode(signature)
      }
    };
  }

  private decodeTxData(data: string): Uint8Array {
    return data.startsWith('0x')
      ? hexToBytes(data as `0x${string}`)
      : Uint8Array.from(atob(data), char => char.charCodeAt(0));
  }
}
