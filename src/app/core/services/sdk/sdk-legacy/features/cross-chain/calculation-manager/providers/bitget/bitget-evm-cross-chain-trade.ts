import { blockchainId, BlockchainsInfo } from '@cryptorubic/core';
import { UserRejectError } from '@cryptorubic/web3';
import { keccak256, numberToHex } from 'viem';
import { RubicError } from '@app/core/errors/models/rubic-error';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { SwapTransactionOptions } from '../../../../common/models/swap-transaction-options';
import { EvmApiCrossChainTrade } from '../../../../ws-api/chains/evm/evm-api-cross-chain-trade';
import { BitgetEvmOrderTx, BitgetSignedOrder } from './models/bitget-order-tx';
import { BitgetOrderSubmitter, getBitgetAdditionalData } from './bitget-order-submitter';

/**
 * Bitget Order mode: all txs of the order (approve, swap) are signed by user without broadcasting
 * and sent to Bitget through rubic-api. Wallet must support `eth_signTransaction`.
 */
export class BitgetEvmCrossChainTrade extends EvmApiCrossChainTrade {
  private readonly order = new BitgetOrderSubmitter(this.rubicApiService);

  public override async swap(options: SwapTransactionOptions = {}): Promise<string | never> {
    const { orderId, srcHash } = await this.order.submit(() => this.prepareAndSign(options));

    this._exchangeId = orderId;
    options.onConfirm?.(srcHash);

    return srcHash;
  }

  private async prepareAndSign(
    options: SwapTransactionOptions
  ): Promise<{ orderId: string; signedOrder: BitgetSignedOrder }> {
    if (!options.testMode) {
      await this.checkTradeErrors();
    }
    await this.checkReceiverAddress(
      options.receiverAddress,
      !BlockchainsInfo.isEvmBlockchainName(this.to.blockchain)
    );

    await this.encode({ ...options, fromAddress: this.walletAddress });

    const { bitgetTxs, bitgetOrderId } = getBitgetAdditionalData(this.lastSwapResponse?.uniqueInfo);
    const orderId = this._exchangeId || bitgetOrderId;
    if (!bitgetTxs?.length || !orderId) {
      throw new RubicError('Bitget did not return an order to sign. Please request a new quote.');
    }

    const allowedToSign = await options.onSimulationSuccess?.();
    if (!allowedToSign) throw new UserRejectError('manual transaction reject');

    const signedTxs: string[] = [];
    for (const tx of bitgetTxs) {
      signedTxs.push(await this.order.requestSignature(() => this.signTransaction(tx)));
    }

    return {
      orderId,
      signedOrder: {
        signedTxs,
        srcHash: keccak256(signedTxs[signedTxs.length - 1] as `0x${string}`)
      }
    };
  }

  private async signTransaction(tx: BitgetEvmOrderTx): Promise<string> {
    const isEip1559 = Boolean(tx.supportEIP1559 && tx.maxFeePerGas);

    const params = {
      from: this.walletAddress,
      to: tx.to,
      data: tx.calldata,
      value: numberToHex(BigInt(tx.value || '0')),
      chainId: numberToHex(blockchainId[this.from.blockchain]),
      ...(tx.gasLimit && { gas: numberToHex(BigInt(tx.gasLimit)) }),
      ...(tx.nonce !== undefined && tx.nonce !== null && { nonce: numberToHex(tx.nonce) }),
      ...(isEip1559
        ? {
            type: '0x2',
            maxFeePerGas: numberToHex(BigInt(tx.maxFeePerGas!)),
            maxPriorityFeePerGas: numberToHex(BigInt(tx.maxPriorityFeePerGas || '0'))
          }
        : {
            type: '0x0',
            ...(tx.gasPrice && { gasPrice: numberToHex(BigInt(tx.gasPrice)) })
          })
    };

    const signed: RubicAny = await this.chainAdapter.signer.wallet.request({
      method: 'eth_signTransaction',
      params: [params]
    } as RubicAny);

    // Some wallets return { raw, tx } instead of raw hex
    const rawTx: string = typeof signed === 'string' ? signed : signed?.raw;
    if (!rawTx) {
      throw new Error('Wallet returned empty signed transaction');
    }
    return rawTx.startsWith('0x') ? rawTx : `0x${rawTx}`;
  }
}
