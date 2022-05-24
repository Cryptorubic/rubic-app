import { Injectable } from '@angular/core';
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
import { WalletConnectorService } from 'src/app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { List } from 'immutable';
import { TableData, TableTrade } from '@shared/models/my-trades/table-trade';
import { BridgeApiService } from 'src/app/core/services/backend/bridge-api/bridge-api.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { CrossChainRoutingApiService } from 'src/app/core/services/backend/cross-chain-routing-api/cross-chain-routing-api.service';
import { GasRefundApiService } from '@core/services/backend/gas-refund-api/gas-refund-api.service';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import { TuiNotification } from '@taiga-ui/core';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RubicError } from '@core/errors/models/rubic-error';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { UserRejectError } from '@core/errors/models/provider/user-reject-error';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { TransactionReceipt } from 'web3-eth';
import { EthereumPolygonBridgeService } from '@features/my-trades/services/ethereum-polygon-bridge-service/ethereum-polygon-bridge.service';

interface HashPair {
  fromTransactionHash: string;
  toTransactionHash: string;
}

@Injectable({
  providedIn: 'root'
})
export class MyTradesService {
  private readonly _tableData$ = new BehaviorSubject<TableData>(undefined);

  public readonly tableData$ = this._tableData$.asObservable();

  private tokens: List<TokenAmount>;

  private walletAddress: string;

  private readonly _warningHandler$ = new Subject<void>();

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    private readonly tokensService: TokensService,
    private readonly bridgeApiService: BridgeApiService,
    private readonly crossChainRoutingApiService: CrossChainRoutingApiService,
    private readonly gasRefundApiService: GasRefundApiService,
    private readonly scannerLinkPipe: ScannerLinkPipe,
    private readonly notificationsService: NotificationsService,
    private readonly translateService: TranslateService,
    private readonly router: Router,
    private readonly ethereumPolygonBridgeService: EthereumPolygonBridgeService
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

  public updateTableTrades(page = 0, pageSize = 10): Observable<TableTrade[]> {
    return combineLatest([
      this.authService.getCurrentUser().pipe(filter(user => user !== undefined)),
      this.tokensService.tokens$.pipe(
        filter(tokens => !!tokens),
        first()
      )
    ]).pipe(
      switchMap(([user, tokens]) => {
        this.tokens = tokens;
        this.walletAddress = user?.address || null;

        if (!this.walletAddress || !tokens.size) {
          this._tableData$.next({
            totalCount: 0,
            trades: []
          });
          return EMPTY;
        }

        return forkJoin([
          this.getBridgeTransactions(),
          this.getCrossChainTrades(page, pageSize)
        ]).pipe(
          map(([bridgeTrades, tableData]) => {
            const adjustedData = bridgeTrades.concat(tableData.trades.flat()).map(trade => ({
              ...trade,
              transactionHashScanUrl: this.scannerLinkPipe.transform(
                trade.fromTransactionHash || trade.toTransactionHash,
                trade.fromTransactionHash
                  ? trade?.fromToken?.blockchain
                  : trade?.toToken?.blockchain,
                ADDRESS_TYPE.TRANSACTION
              )
            }));
            this._tableData$.next({
              totalCount: tableData.totalCount + bridgeTrades.length,
              trades: adjustedData
            });
            return adjustedData;
          })
        );
      }),
      first()
    );
  }

  private getCrossChainTrades(page: number, pageSize: number): Observable<TableData> {
    return this.crossChainRoutingApiService.getUserTrades(this.walletAddress, page, pageSize).pipe(
      map(data => {
        return {
          totalCount: data.totalCount,
          trades: data.trades.map(tableTrade => {
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
          })
        };
      }),
      catchError((err: unknown) => {
        console.debug(err);
        this._warningHandler$.next();
        return of({
          totalCount: 0,
          trades: []
        });
      })
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
          defaultIfEmpty([])
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
            blockchain: trade.fromToken.blockchain
          })
        ).symbol,
        (
          await this.tokensService.getTokenByAddress({
            address: toSymbol,
            blockchain: trade.toToken.blockchain
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

  public getTableTradeByDate(date: Date): TableTrade {
    return this._tableData$
      .getValue()
      ?.trades.find(trade => trade.date.getTime() === date.getTime());
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
