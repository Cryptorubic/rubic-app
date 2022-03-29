import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, filter, first, map, switchMap } from 'rxjs/operators';
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

/*
interface HashPair {
  fromTransactionHash: string;
  toTransactionHash: string;
}
*/

@Injectable({
  providedIn: 'root'
})
export class MyTradesService {
  private _tableData$ = new BehaviorSubject<TableData>(undefined);

  public tableData$ = this._tableData$.asObservable();

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

  public updateTableTrades(page = 0): Observable<TableTrade[]> {
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
          this._tableData$.next({
            totalCount: 0,
            trades: []
          });
          return EMPTY;
        }

        return forkJoin([this.getCrossChainTrades(page)]).pipe(
          map(([tableData]) => {
            const adjustedData = tableData.trades.flat().map(trade => ({
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
              totalCount: tableData.totalCount,
              trades: adjustedData
            });
            return adjustedData;
          })
        );
      }),
      first()
    );
  }

  /*
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
  */

  private getCrossChainTrades(page: number): Observable<TableData> {
    return this.crossChainRoutingApiService.getUserTrades(this.walletAddress, page).pipe(
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

  /*
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
  */

  public getTableTradeByDate(date: Date): TableTrade {
    return this._tableData$
      .getValue()
      ?.trades.find(trade => trade.date.getTime() === date.getTime());
  }
}
