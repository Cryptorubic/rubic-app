import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { UiRecentTrade } from '../../models/ui-recent-trade.interface';
import { interval } from 'rxjs';
import { first, startWith, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { getStatusBadgeText, getStatusBadgeType } from '../../utils/recent-trades-utils';
import { ScannerLinkPipe } from '@shared/pipes/scanner-link.pipe';
import ADDRESS_TYPE from '@shared/models/blockchain/address-type';
import { RecentTradesService } from '@core/recent-trades/services/recent-trades.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { isCrossChainRecentTrade } from '@shared/utils/recent-trades/is-cross-chain-recent-trade';
import { blockchainLabel } from '@shared/constants/blockchain/blockchain-label';
import { isOnramperRecentTrade } from '@shared/utils/recent-trades/is-onramper-recent-trade';
import { STATUS_BADGE_TEXT } from '@core/recent-trades/constants/status-badge-text.map';
import { OnramperService } from '@core/services/onramper/onramper.service';
import { SwapFormQueryService } from '@core/services/swaps/swap-form-query.service';
import {
  BlockchainsInfo,
  CbridgeCrossChainSupportedBlockchain,
  CROSS_CHAIN_TRADE_TYPE,
  TxStatus
} from 'rubic-sdk';
import { TransactionReceipt } from 'web3-eth';
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

  @Output() onClose = new EventEmitter<void>();

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly CrossChainTxStatus = TxStatus;

  public readonly getStatusBadgeType: (status: TxStatus) => string = getStatusBadgeType;

  public readonly getFromStatusBadgeText: (status: TxStatus) => string = getStatusBadgeText;

  public readonly defaultTokenImage = 'assets/images/icons/coins/default-token-ico.svg';

  public revertBtnLoading = false;

  public get isSymbiosisTrade(): boolean {
    return (
      isCrossChainRecentTrade(this.trade) &&
      this.trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS
    );
  }

  public get showRevert(): boolean {
    return (
      (this.isSymbiosisTrade || this.isCbridgeTrade) &&
      this.uiTrade?.statusTo === this.CrossChainTxStatus.REVERT
    );
  }

  public get isCbridgeTrade(): boolean {
    return (
      isCrossChainRecentTrade(this.trade) &&
      this.trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE
    );
  }

  public get fromAssetTypeName(): string {
    if (!this.uiTrade) {
      return '';
    }
    if (BlockchainsInfo.isBlockchainName(this.uiTrade.fromAssetType)) {
      return blockchainLabel[this.uiTrade.fromAssetType];
    }
    return 'Fiats';
  }

  public readonly BLOCKCHAIN_LABEL = blockchainLabel;

  public get showToContinue(): boolean {
    return (
      isOnramperRecentTrade(this.trade) &&
      !this.uiTrade?.statusTo &&
      this.uiTrade?.statusFrom === TxStatus.SUCCESS
    );
  }

  constructor(
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService,
    private readonly recentTradesService: RecentTradesService,
    private readonly tokensService: TokensService,
    private readonly onramperService: OnramperService,
    private readonly swapFormQueryService: SwapFormQueryService
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
      this.swapFormQueryService.initialLoading$.pipe(first(loading => !loading)).subscribe(() => {
        this.initialLoading = false;
        this.cdr.markForCheck();
      });
    }
  }

  public getToStatusBadgeText(status: TxStatus): string {
    if (isOnramperRecentTrade(this.trade)) {
      if (this.uiTrade?.statusFrom === TxStatus.PENDING) {
        return 'Waiting';
      }
      if (this.uiTrade?.statusFrom === TxStatus.FAIL) {
        return STATUS_BADGE_TEXT[TxStatus.FAIL];
      }
      if (this.uiTrade) {
        return getStatusBadgeText(status);
      }
      return '';
    }
    return getStatusBadgeText(status);
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

  public async revertTrade(): Promise<void> {
    if (!isCrossChainRecentTrade(this.trade)) {
      return;
    }

    this.revertBtnLoading = true;

    let revertTxReceipt: TransactionReceipt;

    if (this.isSymbiosisTrade) {
      revertTxReceipt = await this.recentTradesService.revertSymbiosis(
        this.trade.srcTxHash,
        this.trade.fromToken.blockchain
      );
    }

    if (this.isCbridgeTrade) {
      revertTxReceipt = await this.recentTradesService.revertCbridge(
        this.trade.srcTxHash,
        this.trade.fromToken.blockchain as CbridgeCrossChainSupportedBlockchain
      );
    }

    if (revertTxReceipt.status) {
      this.uiTrade.statusTo = TxStatus.FALLBACK;
      this.revertBtnLoading = false;
      this.uiTrade.dstTxHash = revertTxReceipt.transactionHash;
      this.uiTrade.dstTxLink = new ScannerLinkPipe().transform(
        revertTxReceipt.transactionHash,
        this.trade.fromToken.blockchain,
        ADDRESS_TYPE.TRANSACTION
      );
      this.cdr.detectChanges();
    }
  }

  public async continueOnramperTrade(): Promise<void> {
    if (!isOnramperRecentTrade(this.trade)) {
      return;
    }

    await this.onramperService.updateSwapFormByRecentTrade(this.trade.txId);
    this.onClose.emit();
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
