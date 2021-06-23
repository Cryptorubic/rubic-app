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
import { catchError, first, map, mergeMap, switchMap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/web3-public-service/Web3Public';
import { bridgeTestTokens } from 'src/test/tokens/bridge-tokens';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { WalletError } from 'src/app/shared/models/errors/provider/WalletError';
import { AccountError } from 'src/app/shared/models/errors/provider/AccountError';
import { NetworkError } from 'src/app/shared/models/errors/provider/NetworkError';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { RubicError } from 'src/app/shared/models/errors/RubicError';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { TokensService } from 'src/app/core/services/backend/tokens-service/tokens.service';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { BridgeToken } from '../../models/BridgeToken';
import { BridgeTradeRequest } from '../../models/BridgeTradeRequest';
import InsufficientFundsError from '../../../../shared/models/errors/instant-trade/InsufficientFundsError';

@Injectable()
export class BridgeService {
  private blockchainsProviders;

  private tokens$ = new BehaviorSubject<BlockchainsBridgeTokens[]>([]);

  public get tokens(): Observable<BlockchainsBridgeTokens[]> {
    return this.tokens$.asObservable();
  }

  private bridgeProvider: BlockchainsBridgeProvider;

  private _isTestingMode = false;

  private _backendTokens: List<TokenAmount>;

  constructor(
    private readonly ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private readonly rubicBridgeProviderService: EthereumBinanceRubicBridgeProviderService,
    private readonly ethereumPolygonBridgeProviderService: EthereumPolygonBridgeProviderService,
    private readonly ethereumTronBridgeProviderService: EthereumTronBridgeProviderService,
    private readonly ethereumXdaiBridgeProviderService: EthereumXdaiBridgeProviderService,
    private readonly binanceTronBridgeProviderService: BinanceTronBridgeProviderService,
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
    });

    this.subscribeToFormChanges();

    this.useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.tokens$.next(bridgeTestTokens);
      }
    });
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
      }),
      first()
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

  private getBridgeTrade(bridgeTradeRequest?: BridgeTradeRequest): Observable<BridgeTrade> {
    const { fromBlockchain, toBlockchain, fromAmount } =
      this.swapFormService.commonTrade.value.input;

    return this.getCurrentBridgeToken().pipe(
      map(bridgeToken => ({
        fromBlockchain,
        toBlockchain,
        token: bridgeToken,
        amount: fromAmount,
        toAddress: bridgeTradeRequest?.toAddress || this.authService.user.address,
        onTransactionHash: bridgeTradeRequest?.onTransactionHash || (() => {})
      }))
    );
  }

  public createTrade(bridgeTradeRequest: BridgeTradeRequest): Observable<TransactionReceipt> {
    return defer(() =>
      this.getBridgeTrade(bridgeTradeRequest).pipe(
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
          return this.bridgeProvider.createTrade(bridgeTrade).pipe(
            catchError(err => {
              console.error(err);
              const error = err instanceof RubicError ? err : new RubicError();
              return throwError(error);
            })
          );
        })
      )
    );
  }

  public needApprove(): Observable<boolean> {
    return this.getBridgeTrade().pipe(
      switchMap(bridgeTrade =>
        this.bridgeProvider.needApprove(bridgeTrade).pipe(
          catchError(err => {
            console.error(err);
            const error = err instanceof RubicError ? err : new RubicError();
            return throwError(error);
          })
        )
      ),
      first()
    );
  }

  public approve(bridgeTradeRequest: BridgeTradeRequest): Observable<TransactionReceipt> {
    return this.getBridgeTrade(bridgeTradeRequest).pipe(
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
        return this.bridgeProvider.approve(bridgeTrade).pipe(
          catchError(err => {
            console.error(err);
            const error = err instanceof RubicError ? err : new RubicError();
            return throwError(error);
          })
        );
      })
    );
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
        this.providerConnectorService.network?.name !== `${blockchain}_TESTNET`)
    ) {
      throw new NetworkError(blockchain);
    }
  }
}
