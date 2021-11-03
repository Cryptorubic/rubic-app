import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable, of, throwError, zip } from 'rxjs';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { EthereumBinanceBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { EthereumTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { EthereumXdaiBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-xdai-bridge-provider/ethereum-xdai-bridge-provider.service';
import { BinanceTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';
import { BlockchainsBridgeProvider } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/blockchains-bridge-provider';
import { BridgeTokenPairsByBlockchains } from 'src/app/features/bridge/models/BridgeTokenPairsByBlockchains';
import { catchError, filter, first, map, mergeMap, switchMap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { Web3Public } from 'src/app/core/services/blockchain/web3/web3-public-service/Web3Public';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3/web3-public-service/web3-public.service';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/providers/provider-connector-service/provider-connector.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { BridgeTrade } from 'src/app/features/bridge/models/BridgeTrade';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UndefinedError } from 'src/app/core/errors/models/undefined.error';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { BinancePolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-bridge-provider.service';
import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { bridgeTestTokens } from 'src/test/tokens/bridge-tokens';
import { BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';
import { BridgeTradeRequest } from '../../models/BridgeTradeRequest';

@Injectable()
export class BridgeService {
  private blockchainsProviders: Partial<
    Record<BLOCKCHAIN_NAME, Partial<Record<BLOCKCHAIN_NAME, BlockchainsBridgeProvider>>>
  >;

  private _tokens$ = new BehaviorSubject<BridgeTokenPairsByBlockchains[]>([]);

  public get tokens$(): Observable<BridgeTokenPairsByBlockchains[]> {
    return this._tokens$.asObservable();
  }

  private bridgeProvider: BlockchainsBridgeProvider;

  private isTestingMode = false;

  constructor(
    private readonly ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private readonly rubicBridgeProviderService: EthereumBinanceRubicBridgeProviderService,
    private readonly ethereumPolygonBridgeProviderService: EthereumPolygonBridgeProviderService,
    private readonly ethereumTronBridgeProviderService: EthereumTronBridgeProviderService,
    private readonly ethereumXdaiBridgeProviderService: EthereumXdaiBridgeProviderService,
    private readonly binanceTronBridgeProviderService: BinanceTronBridgeProviderService,
    private readonly binancePolygonProviderService: BinancePolygonBridgeProviderService,
    private readonly authService: AuthService,
    private readonly web3PublicService: Web3PublicService,
    private readonly providerConnectorService: ProviderConnectorService,
    private readonly useTestingModeService: UseTestingModeService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly tokensService: TokensService,
    private readonly swapFormService: SwapFormService
  ) {
    this.setupBlockchainsProviders();
    this.subscribeToFormChanges();

    this.setTokens();

    useTestingModeService.isTestingMode.subscribe(isTestingMode => {
      if (isTestingMode) {
        this.isTestingMode = true;
        this._tokens$.next(bridgeTestTokens);
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
        [BLOCKCHAIN_NAME.POLYGON]: this.binancePolygonProviderService,
        [BLOCKCHAIN_NAME.TRON]: this.binanceTronBridgeProviderService
      },
      [BLOCKCHAIN_NAME.POLYGON]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumPolygonBridgeProviderService,
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.binancePolygonProviderService
      }
    };
  }

  private subscribeToFormChanges(): void {
    this.swapFormService.inputValueChanges.subscribe(formData => {
      this.bridgeProvider =
        this.blockchainsProviders[formData.fromBlockchain]?.[formData.toBlockchain];
    });
  }

  private setTokens(): void {
    const tokensObservables: Observable<BridgeTokenPairsByBlockchains>[] = [];

    Object.values(BLOCKCHAIN_NAME).forEach(fromBlockchain => {
      Object.values(BLOCKCHAIN_NAME).forEach(toBlockchain => {
        if (fromBlockchain.includes('_TESTNET') || toBlockchain.includes('_TESTNET')) {
          return;
        }

        const provider: BlockchainsBridgeProvider =
          this.blockchainsProviders[fromBlockchain]?.[toBlockchain];

        if (provider) {
          tokensObservables.push(
            provider.tokenPairs$.pipe(
              map(bridgeTokens => ({
                fromBlockchain,
                toBlockchain,
                tokenPairs: bridgeTokens
              }))
            )
          );
        }
      });
    });

    zip(...tokensObservables)
      .pipe(first())
      .subscribe(tokens => {
        if (!this.isTestingMode) {
          this._tokens$.next(tokens);
        }
      });
  }

  public async isBridgeSupported(): Promise<boolean> {
    const { fromToken, toToken } = this.swapFormService.inputValue;
    if (!fromToken || !toToken) {
      return !!this.bridgeProvider;
    }
    return !!this.bridgeProvider && !!(await this.getCurrentBridgeToken().toPromise());
  }

  public getFee(): Observable<number | null> {
    if (!this.bridgeProvider) {
      return of(null);
    }

    return this.getCurrentBridgeToken().pipe(
      mergeMap(bridgeToken => {
        const { toBlockchain, fromAmount } = this.swapFormService.commonTrade.controls.input.value;

        if (!bridgeToken || !fromAmount) {
          return of(null);
        }

        return this.bridgeProvider.getFee(bridgeToken, toBlockchain, fromAmount);
      }),
      first()
    );
  }

  public getCurrentBridgeToken(): Observable<BridgeTokenPair> {
    return this.tokens$.pipe(
      filter(tokens => !!tokens.length),
      first(),
      map(tokens => {
        const { fromBlockchain, toBlockchain, fromToken, toToken } =
          this.swapFormService.inputValue;
        if (!fromToken || !toToken) {
          return null;
        }

        const bridgeTokensList = tokens.find(
          item => item.fromBlockchain === fromBlockchain && item.toBlockchain === toBlockchain
        );

        const bridgeToken = bridgeTokensList?.tokenPairs?.find(
          item =>
            item.tokenByBlockchain[fromBlockchain].address.toLowerCase() ===
              fromToken.address.toLowerCase() &&
            item.tokenByBlockchain[toBlockchain].address.toLowerCase() ===
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
    const { fromBlockchain, toBlockchain, fromAmount } = this.swapFormService.inputValue;

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
        mergeMap(async (bridgeTrade: BridgeTrade) => {
          this.providerConnectorService.checkSettings(bridgeTrade.fromBlockchain);

          const token = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
          await this.checkBalance(bridgeTrade.fromBlockchain, token, bridgeTrade.amount);

          return bridgeTrade;
        }),
        mergeMap((bridgeTrade: BridgeTrade) => {
          return this.bridgeProvider.createTrade(bridgeTrade).pipe(
            catchError((err: unknown) => {
              console.debug(err);
              const error = err instanceof RubicError ? err : new UndefinedError();
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
          catchError((err: unknown) => {
            console.error(err);
            const error = err instanceof RubicError ? err : new UndefinedError();
            return throwError(error);
          })
        )
      ),
      first()
    );
  }

  public approve(bridgeTradeRequest: BridgeTradeRequest): Observable<TransactionReceipt> {
    return this.getBridgeTrade(bridgeTradeRequest).pipe(
      mergeMap(async (bridgeTrade: BridgeTrade) => {
        this.providerConnectorService.checkSettings(bridgeTrade.fromBlockchain);

        const token = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
        await this.checkBalance(bridgeTrade.fromBlockchain, token, bridgeTrade.amount);

        return bridgeTrade;
      }),
      mergeMap((bridgeTrade: BridgeTrade) => {
        return this.bridgeProvider.approve(bridgeTrade).pipe(
          catchError((err: unknown) => {
            console.debug(err);
            const error = err instanceof RubicError ? err : new UndefinedError();
            return throwError(error);
          })
        );
      })
    );
  }

  private async checkBalance(
    fromBlockchain: BLOCKCHAIN_NAME,
    token: BlockchainToken,
    amount: BigNumber
  ): Promise<void> {
    const web3Public: Web3Public = this.web3PublicService[fromBlockchain];
    return web3Public.checkBalance(token, amount, this.authService.user.address);
  }
}
