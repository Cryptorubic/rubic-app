import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { CROSS_CHAIN_TRADE_TYPE, TxStatus } from 'rubic-sdk';
import { interval } from 'rxjs';
import { startWith, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { RecentTradesService } from '@core/recent-trades/services/recent-trades.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';

@Component({
  selector: '[trade-row]',
  templateUrl: './trade-row.component.html',
  styleUrls: ['./trade-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradeRowComponent implements OnInit, OnDestroy {
  @Input() trade: RecentTrade;

  @Input() mode: 'mobile' | 'table-row';

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly CrossChainTxStatus = TxStatus;

  public readonly getStatusBadgeType: (status: TxStatus) => string = getStatusBadgeType;

  public readonly getStatusBadgeText: (status: TxStatus) => string = getStatusBadgeText;

  public readonly defaultTokenImage = 'assets/images/icons/coins/default-token-ico.svg';

  public get isSymbiosisTrade(): boolean {
    return this.trade?.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS;
  }

  public revertBtnLoading = false;

  constructor(
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService,
    private readonly recentTradesService: RecentTradesService,
    private readonly tokensService: TokensService
  ) {}

  ngOnInit(): void {
    this.initTradeDataPolling();
  }

  ngOnDestroy(): void {
    this.saveTrades();
  }

  public async getTradeData(trade: RecentTrade): Promise<UiRecentTrade> {
    return await this.recentTradesService.getTradeData(trade);
  }

  private initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData(this.trade)),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(uiTrade => uiTrade?.statusTo === TxStatus.PENDING),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  protected setUiTrade(uiTrade: UiRecentTrade): void {
    this.uiTrade = uiTrade;
    if (this.initialLoading) {
      this.initialLoading = false;
    }
  }

  private saveTrades(): void {
    const isCrossChainFinished = this.uiTrade.statusTo !== TxStatus.PENDING;
    this.recentTradesStoreService.updateTrade({
      ...this.trade,
      ...(isCrossChainFinished && {
        calculatedStatusTo: this.uiTrade.statusTo,
        calculatedStatusFrom: this.uiTrade.statusFrom
      }),
      dstTxHash: this.uiTrade.dstTxHash
    });
  }

  public async revertSymbiosis(): Promise<void> {
    this.revertBtnLoading = true;

    const revertTxReceipt = await this.recentTradesService.revertSymbiosis(
      this.trade.srcTxHash,
      this.trade.fromToken.blockchain
    );

    if (revertTxReceipt.status) {
      this.uiTrade.statusTo = TxStatus.FALLBACK;
      this.revertBtnLoading = false;
      this.uiTrade.dstTxHash = revertTxReceipt.transactionHash;
      this.uiTrade.dstTxLink = new ScannerLinkPipe().transform(
        revertTxReceipt.transactionHash,
        this.uiTrade.fromBlockchain.key,
        ADDRESS_TYPE.TRANSACTION
      );
      this.cdr.detectChanges();
    }
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
