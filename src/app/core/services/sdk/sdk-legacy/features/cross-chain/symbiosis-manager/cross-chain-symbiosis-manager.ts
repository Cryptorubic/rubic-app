import { TransactionRequest } from '@ethersproject/providers';
import { SwapTransactionOptions } from '../../common/models/swap-transaction-options';
import { SymbiosisRevertResponse } from './models/symbiosis-revert-api';
import { SymbiosisStuckedResponse } from './models/symbiosis-stucked-api';
import { TransactionReceipt } from 'viem';
import { RubicSdkError } from '@cryptorubic/web3';
import { SdkLegacyService } from '../../../sdk-legacy.service';
import { firstValueFrom } from 'rxjs';
import { blockchainId, BlockchainName, EvmBlockchainName } from '@cryptorubic/core';

export class CrossChainSymbiosisManager {
  constructor(private readonly sdkLegacyService: SdkLegacyService) {}

  public async getUserTrades(fromAddress: string): Promise<SymbiosisStuckedResponse[]> {
    return this.getSymbiosisStuckedTrades(fromAddress);
  }

  private getSymbiosisStuckedTrades(fromAddress: string): Promise<SymbiosisStuckedResponse[]> {
    return firstValueFrom(
      this.sdkLegacyService.httpClient.get<SymbiosisStuckedResponse[]>(
        `https://api-v2.symbiosis.finance/crosschain/v1/stucked/${fromAddress}`
      )
    )
      .then(response => response.filter(trade => Boolean(trade.hash)))
      .catch(() => [] as SymbiosisStuckedResponse[]);
  }

  //@TODO API
  public async revertTrade(
    revertTransactionHash: string,
    userAddress: string,
    options: SwapTransactionOptions = {}
  ): Promise<TransactionReceipt> {
    const stuckedTrades = await this.getUserTrades(userAddress);
    const stuckedTrade = stuckedTrades.find(
      trade => trade.hash.toLowerCase() === revertTransactionHash.toLowerCase()
    );
    if (!stuckedTrade) {
      throw new RubicSdkError('No request with provided transaction hash');
    }

    const transactionRequest = await this.getRevertTransactionRequest(stuckedTrade);
    const blockchain = Object.entries(blockchainId).find(
      ([_, id]) => id === stuckedTrade.chainId
    )![0] as BlockchainName;
    const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      blockchain as EvmBlockchainName
    );

    await adapter.signer.checkBlockchainCorrect(blockchain);

    const { onConfirm, gasLimit, gasPriceOptions } = options;
    const onTransactionHash = (hash: string) => {
      if (onConfirm) {
        onConfirm(hash);
      }
    };

    return adapter.signer.trySendTransaction({
      txOptions: {
        data: transactionRequest.data!.toString(),
        value: transactionRequest.value?.toString() || '0',
        onTransactionHash,
        gas: gasLimit,
        gasPriceOptions
      }
    });
  }

  private async getRevertTransactionRequest(
    stuckedTrade: SymbiosisStuckedResponse
  ): Promise<TransactionRequest> {
    return (
      await firstValueFrom(
        this.sdkLegacyService.httpClient.post<SymbiosisRevertResponse>(
          `https://api-v2.symbiosis.finance/crosschain/v1/revert`,
          {
            transactionHash: stuckedTrade.hash,
            chainId: stuckedTrade.chainId
          }
        )
      )
    ).tx;
  }
}
