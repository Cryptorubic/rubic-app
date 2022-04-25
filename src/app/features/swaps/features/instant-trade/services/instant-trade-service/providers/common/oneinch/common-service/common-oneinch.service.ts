import { inject, Injectable } from '@angular/core';
import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import InstantTradeToken from '@features/swaps/features/instant-trade/models/instant-trade-token';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import BigNumber from 'bignumber.js';
import CustomError from '@core/errors/models/custom-error';
import networks from '@shared/constants/blockchain/networks';
import { TransactionOptions } from '@shared/models/blockchain/transaction-options';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TransactionReceipt } from 'web3-eth';
import { ItOptions } from '@features/swaps/features/instant-trade/services/instant-trade-service/models/it-provider';
import { OneinchSwapResponse } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-swap-response';
import { OneinchQuoteResponse } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-quote-response';
import { OneinchTokensResponse } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-tokens-response';
import { OneinchQuoteRequest } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-quote-request';
import { OneinchSwapRequest } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-swap-request';
import { OneinchNotSupportedTokens } from '@core/errors/models/instant-trade/oneinch-not-supported-tokens';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import InsufficientFundsOneinchError from '@core/errors/models/instant-trade/insufficient-funds-oneinch-error';
import { OneinchQuoteError } from '@core/errors/models/provider/oneinch-quote-error';
import { OneinchInstantTrade } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/models/oneinch-instant-trade';
import { RequiredField } from '@shared/models/utility-types/required-field';
import { EthLikeInstantTradeProviderService } from '@features/swaps/features/instant-trade/services/instant-trade-service/providers/common/eth-like-instant-trade-provider/eth-like-instant-trade-provider.service';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

@Injectable()
export abstract class CommonOneinchService extends EthLikeInstantTradeProviderService {
  public abstract readonly providerType: INSTANT_TRADE_PROVIDER;

  public readonly contractAddress = '0x1111111254fb6c44bac0bed2854e76f90643097d';

  public readonly gasMargin = 1; // 100%

  private readonly oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

  private readonly apiBaseUrl = 'https://api-rubic.1inch.io/v4.0/';

  private supportedTokens: string[] = [];

  // Injected services start
  private readonly httpClient = inject(HttpClient);
  // Injected services end

  protected constructor(blockchain: EthLikeBlockchainName) {
    super(blockchain);
  }

  private getOneInchTokenSpecificAddresses(
    fromAddress: string,
    toAddress: string
  ): { fromTokenAddress: string; toTokenAddress: string } {
    const nativeAddress = this.oneInchNativeAddress;
    const fromTokenAddress = fromAddress === NATIVE_TOKEN_ADDRESS ? nativeAddress : fromAddress;
    const toTokenAddress = toAddress === NATIVE_TOKEN_ADDRESS ? nativeAddress : toAddress;
    return { fromTokenAddress, toTokenAddress };
  }

  private async getSupportedTokensByBlockchain(): Promise<string[]> {
    if (this.supportedTokens.length) {
      return this.supportedTokens;
    }

    const blockchainId = BlockchainsInfo.getBlockchainByName(this.blockchain).id;
    const supportedTokensByBlockchain = await this.httpClient
      .get<OneinchTokensResponse>(`${this.apiBaseUrl}${blockchainId}/tokens`)
      .pipe(
        map(response =>
          Object.keys(response.tokens).map(tokenAddress => tokenAddress.toLowerCase())
        )
      )
      .toPromise();
    this.supportedTokens = supportedTokensByBlockchain;

    return supportedTokensByBlockchain;
  }

  public async calculateTrade(
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<OneinchInstantTrade> {
    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      fromToken.address,
      toToken.address
    );

    const supportedTokensAddresses = await this.getSupportedTokensByBlockchain();
    if (
      !supportedTokensAddresses.includes(fromTokenAddress.toLowerCase()) ||
      !supportedTokensAddresses.includes(toTokenAddress.toLowerCase())
    ) {
      throw new OneinchNotSupportedTokens();
    }

    const amountAbsolute = Web3Pure.toWei(fromAmount, fromToken.decimals);
    const { estimatedGas, toTokenAmount, path, data } = await this.getTradeInfo(
      fromTokenAddress,
      toTokenAddress,
      amountAbsolute,
      shouldCalculateGas,
      fromAddress
    );

    const instantTrade: OneinchInstantTrade = {
      blockchain: this.blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Pure.fromWei(toTokenAmount, toToken.decimals)
      },
      path,
      data
    };
    if (!shouldCalculateGas) {
      return instantTrade;
    }

    const gasPriceInEth = await this.gasService.getGasPriceInEthUnits(this.blockchain);
    const gasFeeInEth = gasPriceInEth.multipliedBy(estimatedGas);
    const ethPrice = await this.tokensService.getNativeCoinPriceInUsd(this.blockchain);
    const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

    return {
      ...instantTrade,
      gasLimit: estimatedGas.toFixed(0),
      gasPrice: Web3Pure.toWei(gasPriceInEth),
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async getTradeInfo(
    fromTokenAddress: string,
    toTokenAddress: string,
    amountAbsolute: string,
    shouldCalculateGas: boolean,
    fromAddress = this.walletAddress
  ): Promise<{
    estimatedGas: BigNumber;
    toTokenAmount: string;
    path: SymbolToken[];
    data: string | null;
  }> {
    const blockchainId = BlockchainsInfo.getBlockchainByName(this.blockchain).id;
    const quoteTradeParams: OneinchQuoteRequest = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: amountAbsolute
      }
    };
    if (this.settings.disableMultihops) {
      quoteTradeParams.params.mainRouteParts = '1';
    }

    let oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse;
    let estimatedGas: BigNumber;
    let toTokenAmount: string;
    let data = null;
    try {
      if (!fromAddress) {
        throw new CustomError('User has not connected');
      }

      if (shouldCalculateGas) {
        if (fromTokenAddress !== this.oneInchNativeAddress) {
          const allowance = await this.getAllowance(fromTokenAddress);
          if (new BigNumber(amountAbsolute).gt(allowance)) {
            throw new CustomError('User have no allowance');
          }
        }
      }

      const swapTradeParams: OneinchSwapRequest = {
        params: {
          ...quoteTradeParams.params,
          slippage: this.settings.slippageTolerance.toString(),
          fromAddress,
          disableEstimate: !shouldCalculateGas
        }
      };
      oneInchTrade = await this.httpClient
        .get<OneinchSwapResponse>(`${this.apiBaseUrl}${blockchainId}/swap`, swapTradeParams)
        .toPromise();

      estimatedGas = new BigNumber(oneInchTrade.tx.gas);
      toTokenAmount = oneInchTrade.toTokenAmount;
      data = oneInchTrade.tx.data;
    } catch (_err) {
      oneInchTrade = await this.httpClient
        .get<OneinchQuoteResponse>(`${this.apiBaseUrl}${blockchainId}/quote`, quoteTradeParams)
        .toPromise();
      if (oneInchTrade.hasOwnProperty('errors') || !oneInchTrade.toTokenAmount) {
        throw new OneinchQuoteError();
      }

      estimatedGas = new BigNumber(oneInchTrade.estimatedGas);
      toTokenAmount = oneInchTrade.toTokenAmount;
    }

    const path = await this.extractPath(fromTokenAddress, toTokenAddress, oneInchTrade);

    return { estimatedGas, toTokenAmount, path, data };
  }

  /**
   * Extracts tokens path from oneInch api response.
   * @return Promise<SymbolToken[]> Tokens array, used in the route.
   */
  private async extractPath(
    fromTokenAddress: string,
    toTokenAddress: string,
    oneInchTrade: OneinchSwapResponse | OneinchQuoteResponse
  ): Promise<SymbolToken[]> {
    const addressesPath = [fromTokenAddress];
    addressesPath.push(...oneInchTrade.protocols[0].map(protocol => protocol[0].toTokenAddress));
    addressesPath.pop();
    addressesPath.push(toTokenAddress);

    const promises = addressesPath.map(async (wrappedTokenAddress, index) => {
      const tokenAddress =
        wrappedTokenAddress === this.oneInchNativeAddress
          ? NATIVE_TOKEN_ADDRESS
          : wrappedTokenAddress;
      let symbol = await this.tokensService.getTokenSymbol(this.blockchain, tokenAddress);
      if (
        index !== 0 &&
        index !== addressesPath.length - 1 &&
        tokenAddress === NATIVE_TOKEN_ADDRESS
      ) {
        symbol = `W${symbol}`;
      }
      return symbol;
    });

    try {
      const symbols = await Promise.all(promises);
      return symbols.map((symbol, index) => ({
        address: addressesPath[index],
        symbol
      }));
    } catch (_err) {
      return [];
    }
  }

  public async createTrade(
    trade: OneinchInstantTrade,
    options: ItOptions
  ): Promise<TransactionReceipt> {
    const transactionOptions = await this.checkAndGetTradeData(trade, options);

    return this.web3PrivateService.trySendTransaction(
      transactionOptions.to,
      transactionOptions.value,
      transactionOptions
    );
  }

  public checkAndEncodeTrade(
    trade: OneinchInstantTrade,
    options: ItOptions,
    receiverAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    return this.checkAndGetTradeData(trade, options, receiverAddress);
  }

  private async checkAndGetTradeData(
    trade: OneinchInstantTrade,
    options: ItOptions,
    receiverAddress = this.walletAddress
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    const { blockchain } = trade;
    this.walletConnectorService.checkSettings(blockchain);

    await this.web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      trade.from.token.address,
      trade.to.token.address
    );

    const fromAmountAbsolute = Web3Pure.toWei(trade.from.amount, trade.from.token.decimals);

    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    const disableEstimate = receiverAddress !== this.walletAddress;
    const swapTradeParams: OneinchSwapRequest = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: fromAmountAbsolute,
        slippage: this.settings.slippageTolerance.toString(),
        fromAddress: receiverAddress,
        disableEstimate
      }
    };
    if (this.settings.disableMultihops) {
      swapTradeParams.params.mainRouteParts = '1';
    }

    const oneInchTrade = await this.httpClient
      .get<OneinchSwapResponse>(`${this.apiBaseUrl}${blockchainId}/swap`, swapTradeParams)
      .pipe(catchError((err: unknown) => this.specifyError(err as HttpErrorResponse, blockchain)))
      .toPromise();

    return {
      to: oneInchTrade.tx.to,
      onTransactionHash: options.onConfirm,
      data: oneInchTrade.tx.data,
      gas: !disableEstimate ? oneInchTrade.tx.gas.toString() : undefined,
      value: fromTokenAddress !== this.oneInchNativeAddress ? '0' : fromAmountAbsolute,
      inWei: fromTokenAddress === this.oneInchNativeAddress || undefined,
      ...(trade.gasPrice && { gasPrice: trade.gasPrice })
    };
  }

  private specifyError(err: unknown, blockchain: EthLikeBlockchainName): never {
    if (err instanceof HttpErrorResponse) {
      if (err.error.message?.includes('cannot estimate')) {
        const nativeToken = networks.find(el => el.name === blockchain).nativeCoin.symbol;
        const message = `1inch sets increased costs on gas fee. For transaction enter less ${nativeToken} amount or top up your ${nativeToken} balance.`;
        throw new CustomError(message);
      }
      if (err.error.message?.includes('insufficient funds for transfer')) {
        const nativeToken = networks.find(el => el.name === blockchain).nativeCoin.symbol;
        throw new InsufficientFundsOneinchError(nativeToken);
      }
      if (err.error.description?.includes('cannot estimate')) {
        throw new TokenWithFeeError();
      }
      throw new CustomError(err.error.message);
    }
    if (err instanceof Error) {
      throw new CustomError(err.message);
    }
    throw new CustomError(err?.toString());
  }
}
