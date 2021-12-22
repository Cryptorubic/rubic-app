import { Injectable } from '@angular/core';
import { EthereumPolygonBridgeService } from 'src/app/features/my-trades/services/ethereum-polygon-bridge-service/ethereum-polygon-bridge.service';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  forkJoin,
  Observable,
  of,
  Subject,
  throwError
} from 'rxjs';
import {
  catchError,
  debounceTime,
  defaultIfEmpty,
  filter,
  first,
  map,
  mergeMap,
  switchMap
} from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TransactionReceipt } from 'web3-eth';
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { List } from 'immutable';
import { TableProvider, TableTrade } from 'src/app/shared/models/my-trades/TableTrade';
import { InstantTradesApiService } from 'src/app/core/services/backend/instant-trades-api/instant-trades-api.service';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { UserRejectError } from 'src/app/core/errors/models/provider/UserRejectError';
import { HttpClient } from '@angular/common/http';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { GasRefundApiService } from '@core/services/backend/gas-refund-api/gas-refund-api.service';
import { TRANSACTION_STATUS } from '@shared/models/blockchain/TRANSACTION_STATUS';
import { compareTokens } from '@shared/utils/utils';
import ADDRESS_TYPE from '@shared/models/blockchain/ADDRESS_TYPE';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import { RubicError } from '@core/errors/models/RubicError';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Web3Pure } from '@core/services/blockchain/blockchain-adapters/common/web3-pure';

interface HashPair {
  fromTransactionHash: string;
  toTransactionHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class MyTradesService {
  private _tableTrades$ = new BehaviorSubject<TableTrade[]>(undefined);

  public tableTrades$ = this._tableTrades$.asObservable();

  private tokens: List<TokenAmount>;

  private walletAddress: string;

  private readonly _warningHandler$ = new Subject<void>();

  constructor(
    private readonly httpClient: HttpClient,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly instantTradesApiService: InstantTradesApiService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly ethereumPolygonBridgeService: EthereumPolygonBridgeService,
    private readonly gasRefundApiService: GasRefundApiService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly router: Router
  ) {
    this.initWarningSubscription();
  }

  private initWarningSubscription(): void {
    this._warningHandler$
      .pipe(
        debounceTime(500),
        filter(
          () => this.router.url === '/my-trades' && Boolean(this.walletConnectorService.address)
        )
      )
      .subscribe(() => {
        this.notificationsService.show(this.translateService.instant('errors.partialTradesData'), {
          label: this.translateService.instant('common.warning'),
          status: TuiNotification.Warning,
          autoClose: 7000
        });
      });
  }

  public updateTableTrades(): Observable<TableTrade[]> {
    return combineLatest([
      this.authService.getCurrentUser().pipe(filter(user => user !== undefined)),
      this.tokensService.tokens$.pipe(
        filter(tokens => !!tokens.size),
        first()
      )
    ]).pipe(
      switchMap(([user, tokens]) => {
        this.tokens = tokens;
        this.walletAddress = user?.address || null;

        if (!this.walletAddress || !tokens.size) {
          this._tableTrades$.next([]);
          return EMPTY;
        }

        return forkJoin([
          this.getBridgeTransactions(),
          this.instantTradesApiService.getUserTrades(this.walletAddress, (err: unknown) => {
            console.debug(err);
            this._warningHandler$.next();
          }),
          this.getCrossChainTrades(),
          this.getGasRefundTrades()
        ]).pipe(
          map(data => {
            this._tableTrades$.next(data.flat());
            return data.flat();
          })
        );
      }),
      first()
    );
  }

  private getBridgeTransactions(): Observable<TableTrade[]> {
    return this.bridgeApiService.getUserTrades(this.walletAddress).pipe(
      switchMap(async trades =>
        (await Promise.all(trades.map(trade => this.prepareBridgeData(trade)))).filter(Boolean)
      ),
      mergeMap(bridgeTrades => {
        const sources: Observable<HashPair>[] = bridgeTrades.map(trade => {
          return of({
            fromTransactionHash: trade.fromTransactionHash,
            toTransactionHash: trade.toTransactionHash
          });
        });
        return forkJoin(sources).pipe(
          map((txHashes: HashPair[]) =>
            txHashes.map(({ fromTransactionHash, toTransactionHash }, index) => ({
              ...bridgeTrades[index],
              fromTransactionHash,
              toTransactionHash
            }))
          ),
          defaultIfEmpty<TableTrade[]>([])
        );
      }),
      catchError((err: unknown) => {
        console.debug(err);
        this._warningHandler$.next();
        return of([]);
      })
    );
  }

  private async prepareBridgeData(trade: TableTrade): Promise<TableTrade> {
    let fromSymbol = trade.fromToken.symbol;
    let toSymbol = trade.toToken.symbol;

    if (trade.provider === 'polygon') {
      [fromSymbol, toSymbol] = await Promise.all([
        (
          await this.tokensService.getTokenByAddress({
            address: fromSymbol,
            blockchain: trade.fromToken.blockchain as BLOCKCHAIN_NAME
          })
        ).symbol,
        (
          await this.tokensService.getTokenByAddress({
            address: toSymbol,
            blockchain: trade.toToken.blockchain as BLOCKCHAIN_NAME
          })
        ).symbol
      ]);

      if (!fromSymbol || !toSymbol) {
        return null;
      }
    }

    return {
      ...trade,
      fromToken: {
        ...trade.fromToken,
        symbol: fromSymbol
      },
      toToken: {
        ...trade.toToken,
        symbol: toSymbol
      }
    };
  }

  private getCrossChainTrades(): Observable<TableTrade[]> {
    return this.crossChainRoutingApiService.getUserTrades(this.walletAddress).pipe(
      map(tableTrades => {
        return tableTrades.map(tableTrade => {
          const { fromToken } = tableTrade;
          const foundFromToken = this.tokens.find(
            token =>
              token.blockchain === fromToken.blockchain &&
              token.address.toLowerCase() === fromToken.address.toLowerCase()
          );
          const { toToken } = tableTrade;
          const foundToToken = this.tokens.find(
            token =>
              token.blockchain === toToken.blockchain &&
              token.address.toLowerCase() === toToken.address.toLowerCase()
          );
          return {
            ...tableTrade,
            fromToken: {
              ...fromToken,
              image: foundFromToken?.image || fromToken.image
            },
            toToken: {
              ...toToken,
              image: foundToToken?.image || toToken.image
            }
          };
        });
      }),
      catchError((err: unknown) => {
        console.debug(err);
        this._warningHandler$.next();
        return of([]);
      })
    );
  }

  private getGasRefundTrades(): Observable<TableTrade[]> {
    return this.gasRefundApiService.getGasRefundTransactions().pipe(
      map(transactions =>
        transactions
          .map(item => {
            const toToken = this.tokens.find(token =>
              compareTokens(token, { address: item.tokenAddress, blockchain: item.network })
            );
            if (!toToken) {
              return null;
            }
            const amount = Web3Pure.fromWei(item.value, toToken.decimals).toFixed();
            return {
              fromTransactionHash: item.hash,
              transactionHashScanUrl: this.scannerLinkPipe.transform(
                item.hash,
                item.network,
                ADDRESS_TYPE.TRANSACTION
              ),
              status: TRANSACTION_STATUS.COMPLETED,
              provider: 'GAS_REFUND_PROVIDER' as TableProvider,
              fromToken: null,
              toToken: {
                ...toToken,
                amount
              },
              date: item.date
            };
          })
          .filter(item => !!item)
      ),
      catchError((err: unknown) => {
        console.debug(err);
        this._warningHandler$.next();
        return of([]);
      })
    );
  }

  public getTableTradeByDate(date: Date): TableTrade {
    return this._tableTrades$.getValue()?.find(trade => trade.date.getTime() === date.getTime());
  }

  public depositPolygonBridgeTradeAfterCheckpoint(
    burnTransactionHash: string,
    onTransactionHash: (hash: string) => void
  ): Observable<TransactionReceipt> {
    try {
      this.walletConnectorService.checkSettings(BLOCKCHAIN_NAME.ETHEREUM);
    } catch (err) {
      return throwError(err);
    }

    return this.ethereumPolygonBridgeService
      .depositTradeAfterCheckpoint(burnTransactionHash, onTransactionHash)
      .pipe(
        catchError((err: unknown) => {
          if ((err as RubicError<ERROR_TYPE>)?.code === 4001) {
            return throwError(new UserRejectError());
          }
          return throwError(err);
        })
      );
  }
}
