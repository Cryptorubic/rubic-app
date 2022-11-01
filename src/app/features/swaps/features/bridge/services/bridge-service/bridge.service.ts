import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable, of, Subscription, throwError, zip } from 'rxjs';
import { EthereumBinanceBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { BlockchainsBridgeProvider } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/common/blockchains-bridge-provider';
import { BridgeTokenPairsByBlockchains } from '@features/swaps/features/bridge/models/bridge-token-pairs-by-blockchains';
import { catchError, first, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import BigNumber from 'bignumber.js';
import { TransactionReceipt } from 'web3-eth';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BridgeTrade } from '@features/swaps/features/bridge/models/bridge-trade';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { BridgeTokenPair } from '@features/swaps/features/bridge/models/bridge-token-pair';
import { compareAddresses } from '@shared/utils/utils';
import { SwapFormService } from 'src/app/features/swaps/core/services/swap-form-service/swap-form.service';
import { BridgeTradeRequest } from '@features/swaps/features/bridge/models/bridge-trade-request';
import { BinancePolygonBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-bridge-provider.service';
import { RubicError } from '@core/errors/models/rubic-error';
import { TuiNotification } from '@taiga-ui/core';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TranslateService } from '@ngx-translate/core';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swaps-form/models/swap-provider-type';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';
import { TradeCalculationService } from '@features/swaps/core/services/trade-calculation-service/trade-calculation.service';
import { RUBIC_BRIDGE_PROVIDER } from '@features/swaps/shared/models/trade-provider/bridge-provider';
import {
  BlockchainName,
  BLOCKCHAIN_NAME,
  Injector,
  Web3PublicSupportedBlockchain,
  Token
} from 'rubic-sdk';
import { RubicBridgeSupportedBlockchains } from './blockchains-bridge-provider/common/rubic-bridge/models/types';

@Injectable()
export class BridgeService extends TradeCalculationService {
  private blockchainsProviders: Partial<
    Record<BlockchainName, Partial<Record<BlockchainName, BlockchainsBridgeProvider>>>
  >;

  private _tokens$ = new BehaviorSubject<BridgeTokenPairsByBlockchains[]>(undefined);

  public get tokens$(): Observable<BridgeTokenPairsByBlockchains[]> {
    return this._tokens$.asObservable();
  }

  private bridgeProvider: BlockchainsBridgeProvider;

  constructor(
    // bridge providers start
    private readonly ethereumBinanceBridgeProviderService: EthereumBinanceBridgeProviderService,
    private readonly binancePolygonBridgeProviderService: BinancePolygonBridgeProviderService,
    // bridge providers end
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly swapFormService: SwapFormService,
    private readonly iframeService: IframeService,
    private readonly translateService: TranslateService,
    private readonly gtmService: GoogleTagManagerService
  ) {
    super('bridge');

    this.setupBlockchainsProviders();
    this.subscribeToFormChanges();

    this.setTokens();
  }

  private setupBlockchainsProviders(): void {
    this.blockchainsProviders = {
      [BLOCKCHAIN_NAME.ETHEREUM]: {
        [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: this.ethereumBinanceBridgeProviderService
      },
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        [BLOCKCHAIN_NAME.ETHEREUM]: this.ethereumBinanceBridgeProviderService
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
    const blockchains = Object.values(BLOCKCHAIN_NAME);

    blockchains.forEach(fromBlockchain => {
      blockchains.forEach(toBlockchain => {
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
        this._tokens$.next(tokens);
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
        const { fromBlockchain, toBlockchain, fromAmount } = this.swapFormService.inputValue;

        if (!bridgeToken || !fromAmount) {
          return of(null);
        }

        return this.bridgeProvider.getFee(
          fromBlockchain as RubicBridgeSupportedBlockchains,
          toBlockchain as RubicBridgeSupportedBlockchains,
          bridgeToken
        );
      }),
      first()
    );
  }

  private getCurrentBridgeToken(): Observable<BridgeTokenPair> {
    return this.tokens$.pipe(
      first(tokens => !!tokens.length),
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
            compareAddresses(item.tokenByBlockchain[fromBlockchain].address, fromToken.address) &&
            compareAddresses(item.tokenByBlockchain[toBlockchain].address, toToken.address)
        );

        if (!bridgeToken) {
          return null;
        }
        return bridgeToken;
      })
    );
  }

  public getBridgeTrade(bridgeTradeRequest?: BridgeTradeRequest): Observable<BridgeTrade> {
    const { fromBlockchain, toBlockchain, fromAmount } = this.swapFormService.inputValue;

    return this.getCurrentBridgeToken().pipe(
      map(bridgeToken => ({
        provider: this.bridgeProvider.getProviderType(bridgeToken),
        fromBlockchain,
        toBlockchain,
        token: bridgeToken,
        amount: fromAmount,
        toAddress: bridgeTradeRequest?.toAddress || this.authService.user?.address,
        onTransactionHash: bridgeTradeRequest?.onTransactionHash || (() => {})
      }))
    );
  }

  public createTrade(bridgeTradeRequest: BridgeTradeRequest): Observable<TransactionReceipt> {
    this.checkDeviceAndShowNotification();
    return defer(() =>
      this.getBridgeTrade(bridgeTradeRequest).pipe(
        mergeMap(async (bridgeTrade: BridgeTrade) => {
          const token = bridgeTrade.token.tokenByBlockchain[bridgeTrade.fromBlockchain];
          await this.checkBalance(bridgeTrade.fromBlockchain, token, bridgeTrade.amount);

          return bridgeTrade;
        }),
        mergeMap((bridgeTrade: BridgeTrade) => {
          let subscription$: Subscription;
          bridgeTrade = {
            ...bridgeTrade,
            onTransactionHash: (txHash: string) => {
              this.notifyGtmAfterSignTx(txHash, bridgeTrade);

              subscription$ = this.notifyTradeInProgress(txHash, bridgeTrade.fromBlockchain);
            }
          };

          return this.bridgeProvider.createTrade(bridgeTrade).pipe(
            tap(() => {
              subscription$?.unsubscribe();
              this.showSuccessTrxNotification();
            }),
            catchError((err: unknown) => {
              subscription$?.unsubscribe();

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
    this.checkDeviceAndShowNotification();
    return this.getBridgeTrade(bridgeTradeRequest).pipe(
      mergeMap(async (bridgeTrade: BridgeTrade) => {
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
    fromBlockchain: BlockchainName,
    token: BlockchainToken,
    amount: BigNumber
  ): Promise<void> {
    const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
      fromBlockchain as Web3PublicSupportedBlockchain
    );
    return blockchainAdapter.checkBalance(token as Token, amount, this.authService.user.address);
  }

  private checkDeviceAndShowNotification(): void {
    if (this.iframeService.isIframe && this.iframeService.device === 'mobile') {
      this.notificationsService.show(
        this.translateService.instant('notifications.openMobileWallet'),
        {
          status: TuiNotification.Info,
          autoClose: 5000
        }
      );
    }
  }

  private notifyGtmAfterSignTx(txHash: string, trade: BridgeTrade): void {
    if (trade.provider === RUBIC_BRIDGE_PROVIDER.SWAP_RBC) {
      this.gtmService.fireTxSignedEvent(
        SWAP_PROVIDER_TYPE.BRIDGE,
        txHash,
        trade.token.symbol,
        trade.token.symbol,
        null,
        null
      );
    }
  }
}
