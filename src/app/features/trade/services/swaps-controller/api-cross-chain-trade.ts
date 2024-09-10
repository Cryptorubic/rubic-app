import { BlockchainName, CrossChainTrade, Web3Pure } from 'rubic-sdk';
import { RubicStep } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/models/rubicStep';
import { CrossChainTradeType } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { PriceToken, PriceTokenAmount } from 'rubic-sdk/lib/common/tokens';
import BigNumber from 'bignumber.js';
import { FeeInfo } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/models/fee-info';
import { OnChainSubtype } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/models/on-chain-subtype';
import { BridgeType } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/models/bridge-type';
import { HttpClient } from 'rubic-sdk/lib/core/http-client/models/http-client';
import { Web3Public } from 'rubic-sdk/lib/core/blockchain/web3-public-service/web3-public/web3-public';
import { Web3Private } from 'rubic-sdk/lib/core/blockchain/web3-private-service/web3-private/web3-private';
import { BasicTransactionOptions } from 'rubic-sdk/lib/core/blockchain/web3-private-service/web3-private/models/basic-transaction-options';
import { SwapTransactionOptions } from 'rubic-sdk/lib/features/common/models/swap-transaction-options';
import { EncodeTransactionOptions } from 'rubic-sdk/lib/features/common/models/encode-transaction-options';
import { TradeInfo } from 'rubic-sdk/lib/features/cross-chain/calculation-manager/providers/common/models/trade-info';
import { AbstractAdapter } from '@cryptorubic/adapter/src/lib/adapters/abstract-adapter';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WsResponse } from '@core/services/api-ws/ws-response';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { Token } from '@shared/models/tokens/token';

export class ApiCrossChainTrade extends CrossChainTrade<unknown> {
  protected readonly providerAddress: string;

  protected readonly routePath: RubicStep[] = [];

  protected lastTransactionConfig: unknown = null;

  /**
   * Type of calculated cross-chain trade.
   */
  public readonly type: CrossChainTradeType;

  /**
   * Token to sell with input amount.
   */
  public readonly from: PriceTokenAmount;

  /**
   * Token to get with output amount.
   */
  public readonly to: PriceTokenAmount;

  /**
   * Minimum amount of output token user will get in Eth units.
   */
  public readonly toTokenAmountMin: BigNumber;

  /**
   * Swap fee information.
   */
  public readonly feeInfo: FeeInfo;

  /**
   * Contains on-chain providers' type used in route.
   */
  public readonly onChainSubtype: OnChainSubtype = { from: undefined, to: undefined };

  /**
   * Contains bridge provider's type used in route.
   */
  public readonly bridgeType: BridgeType;

  public readonly isAggregator = false;

  promotions: string[] = [];

  private readonly approveAddress: string;

  // Fake
  protected get fromContractAddress(): string {
    throw new Error('Not supported');
  }

  protected get httpClient(): HttpClient {
    throw new Error('Not supported');
  }

  protected get fromWeb3Public(): Web3Public {
    throw new Error('Not supported');
  }

  protected get web3Private(): Web3Private {
    throw new Error('Not supported');
  }

  protected get walletAddress(): string {
    return this.walletConnectorService.address;
  }

  protected get methodName(): string {
    throw new Error('Not supported');
  }

  get networkFee(): BigNumber {
    // @TODO API
    return new BigNumber(0);
  }

  get platformFee(): BigNumber {
    // @TODO API
    return new BigNumber(0);
  }

  protected get isProxyTrade(): boolean {
    // @TODO API
    return false;
  }

  protected checkAmountChange(_newWeiAmount: string, _oldWeiAmount: string): void {
    throw new Error('Not supported');
  }

  private readonly adapter: AbstractAdapter<unknown, unknown, BlockchainName>;

  public constructor(
    wsTrade: WsResponse,
    fromToken: TokenAmount,
    toToken: Token,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    const { trade } = wsTrade;
    super('', []);

    this.from = new PriceTokenAmount<BlockchainName>({
      address: fromToken.address,
      blockchain: fromToken.blockchain,
      symbol: fromToken.symbol,
      name: fromToken.symbol,
      decimals: fromToken.decimals,
      tokenAmount: fromToken.amount,
      price: new BigNumber(fromToken.price || 0)
    });

    this.to = new PriceTokenAmount<BlockchainName>({
      address: toToken.address,
      blockchain: toToken.blockchain,
      symbol: toToken.symbol,
      name: toToken.symbol,
      decimals: toToken.decimals,
      weiAmount: new BigNumber(trade.estimate.destinationWeiAmount),
      price: new BigNumber(toToken.price || 0)
    });
    this.toTokenAmountMin = Web3Pure.fromWei(
      this.to.weiAmountMinusSlippage(trade.estimate.slippage),
      this.to.decimals
    );
    this.approveAddress = trade.transaction?.approvalAddress;
    this.bridgeType = wsTrade.type as CrossChainTradeType;
    this.type = wsTrade.type as CrossChainTradeType;
    const nativeToken = {
      address: trade.fees.gasTokenFees.nativeToken.address,
      blockchain: fromToken.blockchain,
      symbol: trade.fees.gasTokenFees.nativeToken.symbol,
      name: trade.fees.gasTokenFees.nativeToken.name,
      decimals: trade.fees.gasTokenFees.nativeToken.decimals,
      price: new BigNumber(1)
    };
    this.feeInfo = {
      rubicProxy: {
        fixedFee: {
          amount: new BigNumber(trade.fees.gasTokenFees.protocol.fixedAmount),
          token: new PriceToken(nativeToken)
        }
      },
      provider: {
        cryptoFee: {
          amount: new BigNumber(trade.fees.gasTokenFees.provider.fixedAmount),
          token: new PriceToken(nativeToken)
        }
      }
    };
  }

  public needApprove(): Promise<boolean> {
    // const chainType = BlockchainsInfo.getChainType(this.from.blockchain);
    if (this.from.isNative) {
      return Promise.resolve(false);
    }
    return this.adapter.needPreswapAction(
      this.approveAddress,
      this.from.address,
      this.walletAddress,
      this.from.stringWeiAmount
    );
  }

  public approve(): // options: BasicTransactionOptions,
  // checkNeedApprove?: boolean,
  // amount?: BigNumber | 'infinity'
  Promise<unknown> {
    return this.adapter.handlePreswap(
      this.approveAddress,
      // this.from.address,
      this.walletAddress,
      this.from
    );
  }

  async swap(options?: SwapTransactionOptions): Promise<string | never> {
    console.log(options);
    return '';
  }

  encode(_options: EncodeTransactionOptions): Promise<unknown> {
    throw new Error('Not supported');
  }

  encodeApprove(
    _tokenAddress: string,
    _spenderAddress: string,
    _value: BigNumber | 'infinity',
    _options: BasicTransactionOptions
  ): Promise<unknown> {
    throw new Error('Not supported');
  }

  protected checkTradeErrors(): Promise<void | never> {
    throw new Error('Not supported');
  }

  protected checkWalletConnected(): never | void {
    throw new Error('Not supported');
  }

  protected checkBlockchainCorrect(): Promise<void | never> {
    throw new Error('Not supported');
  }

  protected checkUserBalance(): Promise<void | never> {
    throw new Error('Not supported');
  }

  protected checkFromAddress(
    _fromAddress: string | undefined,
    _isRequired?: boolean,
    _crossChainType?: CrossChainTradeType
  ): Promise<void | never> {
    throw new Error('Not supported');
  }

  protected checkReceiverAddress(
    _receiverAddress: string | undefined,
    _isRequired?: boolean,
    _crossChainType?: CrossChainTradeType
  ): Promise<void | never> {
    throw new Error('Not supported');
  }

  protected getSwapValue(_providerValue?: BigNumber | string | number | null): string {
    throw new Error('Not supported');
  }

  getUsdPrice(_providerFeeTokenPrice?: BigNumber): BigNumber {
    return new BigNumber(0);
  }

  getTradeInfo(): TradeInfo {
    return {
      estimatedGas: null,
      feeInfo: this.feeInfo,
      priceImpact: null,
      slippage: 0,
      routePath: []
    };
  }

  protected getTransactionConfigAndAmount(_receiverAddress?: string): Promise<{
    config: unknown;
    amount: string;
  }> {
    throw new Error('Not supported');
  }

  protected setTransactionConfig(
    _skipAmountChangeCheck: boolean,
    _useCacheData: boolean,
    _receiverAddress?: string
  ): Promise<unknown> {
    throw new Error('Not supported');
  }
}
