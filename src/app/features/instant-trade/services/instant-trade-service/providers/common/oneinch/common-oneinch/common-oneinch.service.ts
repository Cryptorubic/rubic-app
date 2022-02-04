import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { EthLikeWeb3Public } from 'src/app/core/services/blockchain/blockchain-adapters/eth-like/web3-public/eth-like-web3-public';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { catchError, map, startWith } from 'rxjs/operators';
import InstantTradeToken from '@features/instant-trade/models/instant-trade-token';
import InstantTrade from '@features/instant-trade/models/instant-trade';
import { from, Observable, of } from 'rxjs';
import { EthLikeWeb3PrivateService } from '@core/services/blockchain/blockchain-adapters/eth-like/web3-private/eth-like-web3-private.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import BigNumber from 'bignumber.js';
import CustomError from 'src/app/core/errors/models/custom-error';
import networks from 'src/app/shared/constants/blockchain/networks';
import { PublicBlockchainAdapterService } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { TransactionReceipt } from 'web3-eth';
import { ItOptions } from '@features/instant-trade/services/instant-trade-service/models/it-provider';
import { OneinchSwapResponse } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-swap-response';
import { OneinchQuoteResponse } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-quote-response';
import { OneinchTokensResponse } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-tokens-response';
import { OneinchQuoteRequest } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-quote-request';
import { OneinchSwapRequest } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-swap-request';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { OneinchNotSupportedTokens } from 'src/app/core/errors/models/instant-trade/oneinch-not-supported-tokens';
import { SymbolToken } from '@shared/models/tokens/symbol-token';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';
import { TokenWithFeeError } from '@core/errors/models/common/token-with-fee-error';
import InsufficientFundsOneinchError from '@core/errors/models/instant-trade/insufficient-funds-oneinch-error';
import { OneinchQuoteError } from '@core/errors/models/provider/oneinch-quote-error';
import { OneinchInstantTrade } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/oneinch-instant-trade';
import { RequiredField } from '@shared/models/utility-types/required-field';

interface SupportedTokens {
  [BLOCKCHAIN_NAME.ETHEREUM]: string[];
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: string[];
  [BLOCKCHAIN_NAME.POLYGON]: string[];
  [BLOCKCHAIN_NAME.ARBITRUM]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CommonOneinchService {
  public readonly contractAddress: string;

  private readonly oneInchNativeAddress: string;

  private readonly apiBaseUrl: string;

  private readonly supportedTokens: SupportedTokens;

  private walletAddress: string;

  private settings: ItSettingsForm;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3Private: EthLikeWeb3PrivateService,
    private readonly settingsService: SettingsService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService
  ) {
    this.contractAddress = '0x1111111254fb6c44bac0bed2854e76f90643097d';
    this.oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    this.apiBaseUrl = 'https://api.1inch.exchange/v4.0/';

    this.supportedTokens = {
      [BLOCKCHAIN_NAME.ETHEREUM]: [],
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [],
      [BLOCKCHAIN_NAME.POLYGON]: [],
      [BLOCKCHAIN_NAME.ARBITRUM]: []
    };

    this.authService.getCurrentUser().subscribe(user => {
      this.walletAddress = user?.address;
    });

    this.settingsService.instantTradeValueChanges
      .pipe(startWith(this.settingsService.instantTradeValue))
      .subscribe(settingsForm => {
        this.settings = settingsForm;
      });
  }

  private getOneInchTokenSpecificAddresses(
    fromTokenAddress: string,
    toTokenAddress: string
  ): { fromTokenAddress: string; toTokenAddress: string } {
    if (fromTokenAddress === NATIVE_TOKEN_ADDRESS) {
      fromTokenAddress = this.oneInchNativeAddress;
    }
    if (toTokenAddress === NATIVE_TOKEN_ADDRESS) {
      toTokenAddress = this.oneInchNativeAddress;
    }
    return { fromTokenAddress, toTokenAddress };
  }

  private async getSupportedTokensByBlockchain(blockchain: BLOCKCHAIN_NAME): Promise<string[]> {
    blockchain = blockchain as keyof SupportedTokens;
    if (this.supportedTokens[blockchain].length) {
      return this.supportedTokens[blockchain];
    }

    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    const supportedTokensByBlockchain = await this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/tokens`)
      .pipe(
        map((response: OneinchTokensResponse) =>
          Object.keys(response.tokens).map(tokenAddress => tokenAddress.toLowerCase())
        )
      )
      .toPromise();
    this.supportedTokens[blockchain] = supportedTokensByBlockchain;

    return supportedTokensByBlockchain;
  }

  public getAllowance(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    targetContractAddress = this.contractAddress
  ): Observable<BigNumber> {
    if (BlockchainsInfo.getBlockchainType(blockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain] as EthLikeWeb3Public;
    if (blockchainAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }

    return from(
      blockchainAdapter.getAllowance({
        tokenAddress,
        ownerAddress: this.walletAddress,
        spenderAddress: targetContractAddress
      })
    );
  }

  public async approve(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    options: TransactionOptions,
    targetContractAddress = this.contractAddress
  ): Promise<void> {
    this.walletConnectorService.checkSettings(blockchain);

    await this.web3Private.approveTokens(tokenAddress, targetContractAddress, 'infinity', options);
  }

  public async calculateTrade(
    blockchain: BLOCKCHAIN_NAME,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean,
    fromAddress?: string
  ): Promise<InstantTrade> {
    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      fromToken.address,
      toToken.address
    );

    const supportedTokensAddresses = await this.getSupportedTokensByBlockchain(blockchain);
    if (
      !supportedTokensAddresses.includes(fromTokenAddress.toLowerCase()) ||
      !supportedTokensAddresses.includes(toTokenAddress.toLowerCase())
    ) {
      throw new OneinchNotSupportedTokens();
    }

    const amountAbsolute = Web3Pure.toWei(fromAmount, fromToken.decimals);
    const { estimatedGas, toTokenAmount, path, data } = await this.getTradeInfo(
      blockchain,
      fromTokenAddress,
      toTokenAddress,
      amountAbsolute,
      shouldCalculateGas,
      fromAddress
    );

    const instantTrade: OneinchInstantTrade = {
      blockchain,
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

    if (BlockchainsInfo.getBlockchainType(blockchain) !== 'ethLike') {
      throw new CustomError('Wrong blockchain error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain] as EthLikeWeb3Public;
    const gasPrice = await blockchainAdapter.getGasPrice();
    const gasPriceInEth = Web3Pure.fromWei(gasPrice);
    const gasFeeInEth = gasPriceInEth.multipliedBy(estimatedGas);
    const ethPrice = await this.tokensService.getNativeCoinPriceInUsd(blockchain);
    const gasFeeInUsd = gasFeeInEth.multipliedBy(ethPrice);

    return {
      ...instantTrade,
      gasLimit: estimatedGas.toFixed(0),
      gasPrice,
      gasFeeInUsd,
      gasFeeInEth
    };
  }

  private async getTradeInfo(
    blockchain: BLOCKCHAIN_NAME,
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
    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
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
      if (shouldCalculateGas) {
        if (!fromAddress) {
          throw new CustomError('User has not connected');
        }

        if (fromTokenAddress !== this.oneInchNativeAddress) {
          const allowance = await this.getAllowance(blockchain, fromTokenAddress).toPromise();
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

    const path = await this.extractPath(blockchain, fromTokenAddress, toTokenAddress, oneInchTrade);

    return { estimatedGas, toTokenAmount, path, data };
  }

  /**
   * Extracts tokens path from oneInch api response.
   * @return Promise<SymbolToken[]> Tokens array, used in the route.
   */
  private async extractPath(
    blockchain: BLOCKCHAIN_NAME,
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
      let symbol = await this.tokensService.getTokenSymbol(blockchain, tokenAddress);
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

  public async createTrade(trade: InstantTrade, options: ItOptions): Promise<TransactionReceipt> {
    const transactionOptions = await this.checkAndGetTradeData(trade, options);

    return this.web3Private.trySendTransaction(
      transactionOptions.to,
      transactionOptions.value,
      transactionOptions
    );
  }

  public checkAndEncodeTrade(
    trade: InstantTrade,
    options: ItOptions,
    targetWalletAddress: string
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    return this.checkAndGetTradeData(trade, options, targetWalletAddress);
  }

  private async checkAndGetTradeData(
    trade: InstantTrade,
    options: ItOptions,
    targetWalletAddress = this.walletAddress
  ): Promise<RequiredField<TransactionOptions, 'data'>> {
    const { blockchain } = trade;
    this.walletConnectorService.checkSettings(blockchain);

    const web3Public = this.publicBlockchainAdapterService[trade.blockchain];
    await web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      trade.from.token.address,
      trade.to.token.address
    );

    const fromAmountAbsolute = Web3Pure.toWei(trade.from.amount, trade.from.token.decimals);

    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    const disableEstimate = targetWalletAddress !== this.walletAddress;
    const swapTradeParams: OneinchSwapRequest = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: fromAmountAbsolute,
        slippage: this.settings.slippageTolerance.toString(),
        fromAddress: targetWalletAddress,
        disableEstimate
      }
    };
    if (this.settings.disableMultihops) {
      swapTradeParams.params.mainRouteParts = '1';
    }

    const oneInchTrade = (await this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/swap`, swapTradeParams)
      .pipe(catchError((err: unknown) => this.specifyError(err as HttpErrorResponse, blockchain)))
      .toPromise()) as OneinchSwapResponse;

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

  private specifyError(err: unknown, blockchain: BLOCKCHAIN_NAME): never {
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
