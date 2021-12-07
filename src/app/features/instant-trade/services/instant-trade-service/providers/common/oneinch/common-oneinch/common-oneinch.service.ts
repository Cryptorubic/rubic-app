import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import InstantTradeToken from 'src/app/features/instant-trade/models/InstantTradeToken';
import InstantTrade from 'src/app/features/instant-trade/models/InstantTrade';
import { from, Observable, of } from 'rxjs';
import { PrivateAdapterService } from '@core/services/blockchain/web3/web3-private-service/private-adapter.service';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import BigNumber from 'bignumber.js';
import CustomError from 'src/app/core/errors/models/custom-error';
import networks from 'src/app/shared/constants/blockchain/networks';
import { PublicBlockchainAdapterService } from 'src/app/core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TransactionOptions } from 'src/app/shared/models/blockchain/transaction-options';
import { OneinchQuoteError } from 'src/app/core/errors/models/provider/OneinchQuoteError';
import { NATIVE_ETH_LIKE_TOKEN_ADDRESS } from '@shared/constants/blockchain/NATIVE_ETH_LIKE_TOKEN_ADDRESS';
import {
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { TransactionReceipt } from 'web3-eth';
import { ItOptions } from 'src/app/features/instant-trade/services/instant-trade-service/models/ItProvider';
import { OneinchSwapResponse } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchSwapResponse';
import { OneinchQuoteResponse } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchQuoteResponse';
import { OneinchTokensResponse } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchTokensResponse';
import { OneinchApproveResponse } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchApproveResponse';
import { OneinchQuoteRequest } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchQuoteRequest';
import { OneinchSwapRequest } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/models/OneinchSwapRequest';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { OneinchNotSupportedTokens } from 'src/app/core/errors/models/instant-trade/oneinch-not-supported-tokens';
import InsufficientFundsOneinchError from '@core/errors/models/instant-trade/InsufficientFundsOneinchError';
import { SymbolToken } from '@shared/models/tokens/SymbolToken';
import { TokenWithFeeError } from '@core/errors/models/common/TokenWithFeeError';

interface SupportedTokens {
  [BLOCKCHAIN_NAME.ETHEREUM]: string[];
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: string[];
  [BLOCKCHAIN_NAME.POLYGON]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CommonOneinchService {
  private readonly oneInchNativeAddress: string;

  private readonly apiBaseUrl: string;

  private readonly supportedTokens: SupportedTokens;

  private walletAddress: string;

  private settings: ItSettingsForm;

  constructor(
    private readonly httpClient: HttpClient,
    private readonly publicBlockchainAdapterService: PublicBlockchainAdapterService,
    private readonly web3Private: PrivateAdapterService,
    private readonly settingsService: SettingsService,
    private readonly providerConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService
  ) {
    this.oneInchNativeAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
    this.apiBaseUrl = 'https://api.1inch.exchange/v3.0/';

    this.supportedTokens = {
      [BLOCKCHAIN_NAME.ETHEREUM]: [],
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: [],
      [BLOCKCHAIN_NAME.POLYGON]: []
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
    if (fromTokenAddress === NATIVE_ETH_LIKE_TOKEN_ADDRESS) {
      fromTokenAddress = this.oneInchNativeAddress;
    }
    if (toTokenAddress === NATIVE_ETH_LIKE_TOKEN_ADDRESS) {
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

  private loadApproveAddress(blockchainId: number): Observable<string> {
    return this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/approve/spender`)
      .pipe(map((response: OneinchApproveResponse) => response.address));
  }

  public getAllowance(blockchain: BLOCKCHAIN_NAME, tokenAddress: string): Observable<BigNumber> {
    if (BlockchainsInfo.getBlockchainType(blockchain) !== 'ethLike') {
      // @TODO Solana.
      throw new CustomError('Solana error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain] as Web3Public;
    if (blockchainAdapter.isNativeAddress(tokenAddress)) {
      return of(new BigNumber(Infinity));
    }
    return this.loadApproveAddress(BlockchainsInfo.getBlockchainByName(blockchain).id).pipe(
      switchMap(address =>
        from(blockchainAdapter.getAllowance(tokenAddress, this.walletAddress, address))
      )
    );
  }

  public async approve(
    blockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    options: TransactionOptions
  ): Promise<void> {
    this.providerConnectorService.checkSettings(blockchain);

    const approveAddress = await this.loadApproveAddress(
      BlockchainsInfo.getBlockchainByName(blockchain).id
    ).toPromise();
    await this.web3Private.approveTokens(tokenAddress, approveAddress, 'infinity', options);
  }

  public async calculateTrade(
    blockchain: BLOCKCHAIN_NAME,
    fromToken: InstantTradeToken,
    fromAmount: BigNumber,
    toToken: InstantTradeToken,
    shouldCalculateGas: boolean
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

    const amountAbsolute = Web3Public.toWei(fromAmount, fromToken.decimals);
    const { estimatedGas, toTokenAmount, path } = await this.getTradeInfo(
      blockchain,
      fromTokenAddress,
      toTokenAddress,
      amountAbsolute
    );

    const instantTrade: InstantTrade = {
      blockchain,
      from: {
        token: fromToken,
        amount: fromAmount
      },
      to: {
        token: toToken,
        amount: Web3Public.fromWei(toTokenAmount, toToken.decimals)
      },
      path
    };
    if (!shouldCalculateGas) {
      return instantTrade;
    }

    if (BlockchainsInfo.getBlockchainType(blockchain) !== 'ethLike') {
      // @TODO Solana.
      throw new CustomError('Solana error');
    }
    const blockchainAdapter = this.publicBlockchainAdapterService[blockchain] as Web3Public;
    const gasPrice = await blockchainAdapter.getGasPrice();
    const gasPriceInEth = Web3Public.fromWei(gasPrice);
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
    amountAbsolute: string
  ): Promise<{ estimatedGas: BigNumber; toTokenAmount: string; path: SymbolToken[] }> {
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
    try {
      if (!this.walletAddress) {
        throw new Error('User has not connected');
      }

      if (fromTokenAddress !== this.oneInchNativeAddress) {
        const allowance = await this.getAllowance(blockchain, fromTokenAddress).toPromise();
        if (new BigNumber(amountAbsolute).gt(allowance)) {
          throw new Error('User have no allowance');
        }
      }

      const swapTradeParams: OneinchSwapRequest = {
        params: {
          ...quoteTradeParams.params,
          slippage: this.settings.slippageTolerance.toString(),
          fromAddress: this.walletAddress
        }
      };
      oneInchTrade = await this.httpClient
        .get<OneinchSwapResponse>(`${this.apiBaseUrl}${blockchainId}/swap`, swapTradeParams)
        .toPromise();

      estimatedGas = new BigNumber(oneInchTrade.tx.gas);
      toTokenAmount = oneInchTrade.toTokenAmount;
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

    return { estimatedGas, toTokenAmount, path };
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
          ? NATIVE_ETH_LIKE_TOKEN_ADDRESS
          : wrappedTokenAddress;
      let symbol = await this.tokensService.getTokenSymbol(blockchain, tokenAddress);
      if (
        index !== 0 &&
        index !== addressesPath.length - 1 &&
        tokenAddress === NATIVE_ETH_LIKE_TOKEN_ADDRESS
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
    const { blockchain } = trade;
    this.providerConnectorService.checkSettings(blockchain);

    const web3Public = this.publicBlockchainAdapterService[trade.blockchain];
    await web3Public.checkBalance(trade.from.token, trade.from.amount, this.walletAddress);

    const { fromTokenAddress, toTokenAddress } = this.getOneInchTokenSpecificAddresses(
      trade.from.token.address,
      trade.to.token.address
    );

    const fromAmountAbsolute = Web3Public.toWei(trade.from.amount, trade.from.token.decimals);

    const blockchainId = BlockchainsInfo.getBlockchainByName(blockchain).id;
    const swapTradeParams: OneinchSwapRequest = {
      params: {
        fromTokenAddress,
        toTokenAddress,
        amount: fromAmountAbsolute,
        slippage: this.settings.slippageTolerance.toString(),
        fromAddress: this.walletAddress
      }
    };
    if (this.settings.disableMultihops) {
      swapTradeParams.params.mainRouteParts = '1';
    }

    const oneInchTrade = (await this.httpClient
      .get(`${this.apiBaseUrl}${blockchainId}/swap`, swapTradeParams)
      .pipe(catchError((err: unknown) => this.specifyError(err as HttpErrorResponse, blockchain)))
      .toPromise()) as OneinchSwapResponse;

    const trxOptions = {
      onTransactionHash: options.onConfirm,
      data: oneInchTrade.tx.data,
      gas: oneInchTrade.tx.gas.toString(),
      inWei: fromTokenAddress === this.oneInchNativeAddress || undefined,
      ...(trade.gasPrice && { gasPrice: trade.gasPrice })
    };

    return this.web3Private.trySendTransaction(
      oneInchTrade.tx.to,
      fromTokenAddress !== this.oneInchNativeAddress ? '0' : fromAmountAbsolute,
      trxOptions
    );
  }

  private specifyError(err: HttpErrorResponse, blockchain: BLOCKCHAIN_NAME): never {
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
}
