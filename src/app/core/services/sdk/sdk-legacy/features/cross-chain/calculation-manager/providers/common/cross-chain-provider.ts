import { RequiredCrossChainOptions } from '../../models/cross-chain-options';
import { CrossChainTradeType } from '../../models/cross-chain-trade-type';
import { CalculationResult } from './models/calculation-result';
import { FeeInfo } from './models/fee-info';
import { RubicStep } from './models/rubicStep';
import { AbiItem, AbstractAdapter, parseError, RubicSdkError } from '@cryptorubic/web3';
import { HttpClient } from '@angular/common/http';
import { SdkLegacyService } from '@app/core/services/sdk/sdk-legacy/sdk-legacy.service';
import { BlockchainName, PriceToken, PriceTokenAmount } from '@cryptorubic/core';

export abstract class CrossChainProvider {
  public static parseError(err: unknown): RubicSdkError {
    return parseError(err, 'Cannot calculate cross-chain trade');
  }

  public abstract readonly type: CrossChainTradeType;

  protected get httpClient(): HttpClient {
    return this.sdkLegacyService.httpClient;
  }

  protected getChainAdapter(
    fromBlockchain: BlockchainName
  ): AbstractAdapter<any, any, BlockchainName, {}, {}> {
    return this.sdkLegacyService.adaptersFactoryService.getAdapter(fromBlockchain as any);
  }

  constructor(protected readonly sdkLegacyService: SdkLegacyService) {}

  public abstract isSupportedBlockchain(fromBlockchain: BlockchainName): boolean;

  public areSupportedBlockchains(
    fromBlockchain: BlockchainName,
    toBlockchain: BlockchainName
  ): boolean {
    return this.isSupportedBlockchain(fromBlockchain) && this.isSupportedBlockchain(toBlockchain);
  }

  public abstract calculate(
    from: PriceTokenAmount,
    toToken: PriceToken,
    options: RequiredCrossChainOptions
  ): Promise<CalculationResult>;

  protected getWalletAddress(blockchain: BlockchainName): string {
    return this.getChainAdapter(blockchain).client.walletAddress;
  }

  protected abstract getRoutePath(...options: unknown[]): Promise<RubicStep[]>;

  /**
   * Gets fee information.
   * @param _fromBlockchain Source network blockchain.
   * @param _providerAddress Integrator address.
   * @param _percentFeeToken Protocol fee token.
   * @param _useProxy Use rubic proxy or not.
   * @param _contractAbi Rubic Proxy contract abi.
   * @protected
   * @internal
   */
  protected async getFeeInfo(
    _fromBlockchain: Partial<BlockchainName>,
    _providerAddress: string,
    _percentFeeToken: PriceToken,
    _useProxy: boolean,
    _contractAbi?: AbiItem[]
  ): Promise<FeeInfo> {
    return {};
  }
}
