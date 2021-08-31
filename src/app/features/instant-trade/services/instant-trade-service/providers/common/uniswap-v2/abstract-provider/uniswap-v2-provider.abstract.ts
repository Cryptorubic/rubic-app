import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import BigNumber from 'bignumber.js';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { Observable } from 'rxjs';
import {
  ItOptions,
  ItProvider
} from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { TransactionReceipt } from 'web3-eth';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import {
  ContractAddressNetMode,
  RoutingProvidersNetMode,
  WethAddressNetMode
} from 'src/app/features/instant-trade/services/instant-trade-service/models/uniswap-v2/UniswapV2Constants';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';

export class UniswapV2ProviderAbstract implements ItProvider {
  private readonly blockchain: BLOCKCHAIN_NAME;

  private wethAddress: string;

  private contractAddress: string;

  private routingProviders: string[];

  private readonly maxTransitTokens: number;

  constructor(
    blockchain: BLOCKCHAIN_NAME,
    contractAddressNetMode: ContractAddressNetMode,
    wethAddressNetMode: WethAddressNetMode,
    routingProvidersNetMode: RoutingProvidersNetMode,
    maxTransitTokens: number,
    private readonly commonUniswapV2: CommonUniswapV2Service,
    private readonly useTestingModeService: UseTestingModeService
  ) {
    this.blockchain = blockchain;
    this.maxTransitTokens = maxTransitTokens;

    this.wethAddress = wethAddressNetMode.mainnet;
    this.contractAddress = contractAddressNetMode.mainnet;
    this.routingProviders = routingProvidersNetMode.mainnet;

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.wethAddress = wethAddressNetMode.testnet;
        this.contractAddress = contractAddressNetMode.testnet;
        this.routingProviders = routingProvidersNetMode.testnet;
      }
    });
  }

  public getAllowance(tokenAddress: string): Observable<BigNumber> {
    return this.commonUniswapV2.getAllowance(this.blockchain, tokenAddress, this.contractAddress);
  }

  public async approve(tokenAddress: string, options: TransactionOptions): Promise<void> {
    return this.commonUniswapV2.approve(
      this.blockchain,
      tokenAddress,
      this.contractAddress,
      options
    );
  }

  public calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
  ): Promise<InstantTrade> {
    return this.commonUniswapV2.calculateTrade(
      this.blockchain,
      fromToken,
      fromAmount,
      toToken,
      this.wethAddress,
      this.contractAddress,
      this.routingProviders,
      this.maxTransitTokens,
      shouldCalculateGas
    );
  }

  public getFromAmount(
    fromTokenAddress: string,
    toToken: InstantTradeToken,
    toAmount: BigNumber
  ): Promise<BigNumber> {
    return this.commonUniswapV2.getFromAmount(
      this.blockchain,
      fromTokenAddress,
      toToken,
      toAmount,
      this.wethAddress,
      this.routingProviders,
      this.maxTransitTokens,
      this.contractAddress
    );
  }

  public async createTrade(
    trade: InstantTrade,
    options: ItOptions = {}
  ): Promise<TransactionReceipt> {
    return this.commonUniswapV2.createTrade(trade, this.contractAddress, options);
  }
}
