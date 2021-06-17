import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, from, Observable, of, throwError, zip } from 'rxjs';
import { List } from 'immutable';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { EthereumBinanceBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { EthereumTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { EthereumXdaiBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-xdai-bridge-provider/ethereum-xdai-bridge-provider.service';
import { BinanceTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/blockchains-bridge-provider';
import { BlockchainsBridgeTokens } from 'src/app/features/bridge/models/BlockchainsBridgeTokens';
import { first, catchError, map, mergeMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from '../../../../core/services/blockchain/web3-public-service/Web3Public';
import InsufficientFundsError from '../../../../shared/models/errors/instant-trade/InsufficientFundsError';
import { BridgeTrade } from '../../../cross-chain-swaps-page-old/bridge-page/models/BridgeTrade';
import { bridgeTestTokens } from '../../../../../test/tokens/bridge-tokens';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Web3PublicService } from '../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { WalletError } from '../../../../shared/models/errors/provider/WalletError';
import { AccountError } from '../../../../shared/models/errors/provider/AccountError';
import { NetworkError } from '../../../../shared/models/errors/provider/NetworkError';
import { ProviderConnectorService } from '../../../../core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from '../../../../core/services/use-testing-mode/use-testing-mode.service';
import { RubicError } from '../../../../shared/models/errors/RubicError';
import { BridgeTableTrade } from '../../../cross-chain-swaps-page-old/bridge-page/models/BridgeTableTrade';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';
import { BridgeApiService } from '../../../../core/services/backend/bridge-api/bridge-api.service';
import { TokensService } from '../../../../core/services/backend/tokens-service/tokens.service';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { BridgeToken } from '../../models/BridgeToken';
import { BridgeTradeRequest } from '../../models/BridgeTradeRequest';

@Injectable()
export class BridgeService {
  private blockchainsProviders;

  private tokens$ = new BehaviorSubject<BlockchainsBridgeTokens[]>([]);

  public get tokens(): Observable<BlockchainsBridgeTokens[]> {
    return this.tokens$.asObservable();
  }

  private bridgeProvider: BlockchainsBridgeProvider;

  private _isTestingMode = false;

  private _transactions: BehaviorSubject<List<BridgeTableTrade>> = new BehaviorSubject(null);

  private _backendTokens: List<TokenAmount>;

  public readonly transactions: Observable<List<BridgeTableTrade>> =
    this._transactions.asObservable();

  constructor(
    private ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private rubicBridgeProviderService: EthereumBinanceRubicBridgeProviderService,
    private ethereumPolygonBridgeProviderService: EthereumPolygonBridgeProviderService,
    private ethereumTronBridgeProviderService: EthereumTronBridgeProviderService,
    private ethereumXdaiBridgeProviderService: EthereumXdaiBridgeProviderService,
    private binanceTronBridgeProviderService: BinanceTronBridgeProviderService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly swapFormService: SwapFormService
  ) {
    this.setupBlockchainsProviders();
    this.setTokens();
    tokensService.tokens.subscribe(tokens => {
      this._backendTokens = tokens;
      this.updateTransactionsList();
    });

    this.subscribeToFormChanges();
  }

  private setupBlockchainsProviders(): void {
    this.blockchainsProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.ethereumBinanceBridgeProviderService,
        [BLOCKCHAIN_NAME.POLYGON]: this.ethereumPolygonBridgeProviderService,
        [BLOCKCHAIN_NAME.TRON]: this.ethereumTronBridgeProviderService,
        [BLOCKCHAIN_NAME.XDAI]: this.ethereumXdaiBridgeProviderService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumBinanceBridgeProviderService,
        [BLOCKCHAIN_NAME.TRON]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumPolygonBridgeProviderService
      },
      [BLOCKCHAIN_NAME.TRON]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumTronBridgeProviderService,
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.XDAI]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumXdaiBridgeProviderService
      }
    };
  }

  private subscribeToFormChanges(): void {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formData => {
      this.bridgeProvider =
        this.blockchainsProviders[formData.fromBlockchain]?.[formData.toBlockchain];
    });
  }

  private setTokens(): void {
    const tokensObservables: Observable<BlockchainsBridgeTokens>[] = [];

    Object.values(BLOCKCHAIN_NAME).forEach(fromBlockchain => {
      Object.values(BLOCKCHAIN_NAME).forEach(toBlockchain => {
        if (fromBlockchain.includes('_TESTNET') || toBlockchain.includes('_TESTNET')) {
          return;
        }

        const provider: BlockchainsBridgeProvider =
          this.blockchainsProviders[fromBlockchain]?.[toBlockchain];

        if (provider) {
          tokensObservables.push(
            provider.tokens.pipe(
              map(bridgeTokens => {
                return {
                  fromBlockchain,
                  toBlockchain,
                  bridgeTokens
                };
              })
            )
          );
        }
      });
    });

    zip(...tokensObservables)
      .pipe(first())
      .subscribe(tokens => this.tokens$.next(tokens));
  }

  public getFee(): Observable<number | null> {
    if (!this.bridgeProvider) {
      return of(null);
    }

    return this.getCurrentBridgeToken().pipe(
      mergeMap(bridgeToken => {
        const { toBlockchain } = this.swapFormService.commonTrade.value.input;

        if (!bridgeToken) {
          return of(null);
        }

        return this.bridgeProvider.getFee(bridgeToken, toBlockchain);
      })
    );
  }

  public getCurrentBridgeToken(): Observable<BridgeToken> {
    return this.tokens.pipe(
      map(tokens => {
        const { fromBlockchain, toBlockchain, fromToken, toToken } =
          this.swapFormService.commonTrade.value.input;
        const bridgeTokensList = tokens.find(
          item => item.fromBlockchain === fromBlockchain && item.toBlockchain === toBlockchain
        );

        const bridgeToken = bridgeTokensList.bridgeTokens?.find(
          item =>
            item.blockchainToken[fromBlockchain].address.toLowerCase() ===
              fromToken.address.toLowerCase() &&
            item.blockchainToken[toBlockchain].address.toLowerCase() ===
              toToken.address.toLowerCase()
        );

        if (!bridgeToken) {
          return null;
        }

        return bridgeToken;
      })
    );
  }

  public createTrade(bridgeTradeRequest: BridgeTradeRequest): Observable<TransactionReceipt> {
    const { fromBlockchain, toBlockchain, fromAmount } =
      this.swapFormService.commonTrade.value.input;

    return defer(() =>
      this.getCurrentBridgeToken().pipe(
        map(bridgeToken => ({
          fromBlockchain,
          toBlockchain,
          token: bridgeToken,
          amount: fromAmount,
          toAddress: bridgeTradeRequest.toAddress,
          onTransactionHash: bridgeTradeRequest.onTransactionHash
        })),
        mergeMap((bridgeTrade: BridgeTrade) => {
          this.checkSettings(bridgeTrade.fromBlockchain);
          const token = bridgeTrade.token.blockchainToken[bridgeTrade.fromBlockchain];
          return from(
            this.checkBalance(
              bridgeTrade.fromBlockchain,
              bridgeTrade.toBlockchain,
              token.address,
              token.symbol,
              token.decimals,
              bridgeTrade.amount
            )
          ).pipe(map(() => bridgeTrade));
        }),
        mergeMap((bridgeTrade: BridgeTrade) => {
          return this.bridgeProvider
            .createTrade(bridgeTrade, () => this.updateTransactionsList())
            .pipe(
              tap(() => this.updateTransactionsList()),
              catchError(err => {
                console.error(err);
                return throwError(new RubicError());
              })
            );
        })
      )
    );
  }

  public depositPolygonTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<string> {
    try {
      this.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);
    } catch (err) {
      console.error(err);
      throw new RubicError();
    }

    return this.ethereumPolygonBridgeProviderService
      .depositTradeAfterCheckpoint(burnTransactionHash, onTransactionHash, () =>
        this.updateTransactionsList()
      )
      .pipe(
        tap(() => this.updateTransactionsList()),
        catchError(err => {
          console.error(err);
          return throwError(new RubicError());
        })
      );
  }

  public async updateTransactionsList(): Promise<void> {
    if (this.authService.user === null) {
      this._transactions.next(List([]));
      return;
    }

    const userAddress = this.authService.user?.address;
    if (this._backendTokens.size && userAddress) {
      const transactionsApi = await this.bridgeApiService.getTransactions(userAddress);

      const transactions = transactionsApi.map(transaction => {
        const { fromBlockchain, toBlockchain } = transaction;
        let { fromSymbol, toSymbol } = transaction;

        if (
          fromBlockchain === BLOCKCHAIN_NAME.POLYGON ||
          toBlockchain === BLOCKCHAIN_NAME.POLYGON
        ) {
          if (!this._isTestingMode) {
            fromSymbol = this._backendTokens
              .filter(token => token.blockchain === fromBlockchain)
              .find(token => token.address.toLowerCase() === fromSymbol.toLowerCase())?.symbol;
            toSymbol = this._backendTokens
              .filter(token => token.blockchain === toBlockchain)
              .find(token => token.address.toLowerCase() === toSymbol.toLowerCase())?.symbol;
          } else {
            const testBridgeToken = bridgeTestTokens[BLOCKCHAIN_NAME.POLYGON].find(
              token =>
                token.blockchainToken[fromBlockchain].address.toLowerCase() ===
                transaction.fromSymbol.toLowerCase()
            );
            fromSymbol = testBridgeToken?.blockchainToken[fromBlockchain].symbol;
            toSymbol = testBridgeToken?.blockchainToken[toBlockchain].symbol;
          }
        }

        return {
          ...transaction,
          fromSymbol,
          toSymbol
        };
      });

      this._transactions.next(List(transactions));
    }
  }

  private async checkBalance(
    fromBlockchain: BLOCKCHAIN_NAME,
    toBlockchain: BLOCKCHAIN_NAME,
    tokenAddress: string,
    symbol: string,
    decimals: number,
    amount: BigNumber
  ): Promise<void> {
    let web3Public: Web3Public;
    if (
      this._isTestingMode &&
      fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
      toBlockchain === BLOCKCHAIN_NAME.POLYGON
    ) {
      web3Public = this.web3PublicService[BLOCKCHAIN_NAME.GOERLI_TESTNET];
    } else {
      web3Public = this.web3PublicService[fromBlockchain];
    }

    let balance;
    if (web3Public.isNativeAddress(tokenAddress)) {
      balance = await web3Public.getBalance(this.authService.user.address, {
        inWei: true
      });
    } else {
      balance = await web3Public.getTokenBalance(this.authService.user.address, tokenAddress);
    }

    const amountInWei = amount.multipliedBy(10 ** decimals);
    if (balance.lt(amountInWei)) {
      const formattedTokensBalance = balance.div(10 ** decimals).toString();
      throw new InsufficientFundsError(symbol, formattedTokensBalance, amount.toFixed());
    }
  }

  private checkSettings(blockchain: BLOCKCHAIN_NAME): void {
    if (!this.providerConnectorService.isProviderActive) {
      throw new WalletError();
    }

    if (!this.providerConnectorService.address) {
      throw new AccountError();
    }

    if (
      this.providerConnectorService.network?.name !== blockchain &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        this.providerConnectorService.network?.name !== `${blockchain}_TESTNET`) &&
      (!this.useTestingModeService.isTestingMode.getValue() ||
        blockchain !== BLOCKCHAIN_NAME.ETHEREUM ||
        this.providerConnectorService.network?.name !== BLOCKCHAIN_NAME.GOERLI_TESTNET)
    ) {
      throw new NetworkError(blockchain);
    }
  }
}
