import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Self,
  ViewContainerRef
} from '@angular/core';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { RecentTradesStoreService } from '@app/core/services/recent-trades/recent-trades-store.service';
import { interval, timer } from 'rxjs';
import { first, startWith, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import {
  getStatusBadgeText,
  getStatusBadgeType
} from '@core/recent-trades/utils/recent-trades-utils';
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
  ArbitrumRbcBridgeSupportedBlockchain,
  BlockchainsInfo,
  CbridgeCrossChainSupportedBlockchain,
  ChangenowApiStatus,
  CROSS_CHAIN_TRADE_TYPE,
  TxStatus
} from 'rubic-sdk';
import { TransactionReceipt } from 'web3-eth';
import { RecentTrade } from '@shared/models/recent-trades/recent-trade';
import { NAVIGATOR } from '@ng-web-apis/common';
import { UiRecentTrade } from '@core/recent-trades/models/ui-recent-trade.interface';
import { ChangenowPostTrade } from '@features/swaps/core/services/changenow-post-trade-service/models/changenow-post-trade';
import { ModalService } from '@app/core/modals/services/modal.service';

@Component({
  selector: '[trade-row]',
  templateUrl: './trade-row.component.html',
  styleUrls: ['./trade-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TradeRowComponent implements OnInit, OnDestroy {
  @Input() trade: RecentTrade | ChangenowPostTrade;

  @Input() mode: 'mobile' | 'table-row';

  @Output() onClose = new EventEmitter<void>();

  public uiTrade: UiRecentTrade;

  public initialLoading = true;

  public readonly CrossChainTxStatus = TxStatus;

  public readonly getStatusBadgeType: (status: TxStatus | ChangenowApiStatus) => string =
    getStatusBadgeType;

  public readonly getFromStatusBadgeText: (status: TxStatus | ChangenowApiStatus) => string =
    getStatusBadgeText;

  public readonly defaultTokenImage = 'assets/images/icons/coins/default-token-ico.svg';

  public revertBtnLoading = false;

  public get isSymbiosisTrade(): boolean {
    if (this.isChangenowTrade(this.trade)) {
      return false;
    }
    return (
      isCrossChainRecentTrade(this.trade) &&
      this.trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.SYMBIOSIS
    );
  }

  public get isArbitrumBridgeTrade(): boolean {
    if (this.isChangenowTrade(this.trade)) {
      return false;
    }
    return (
      isCrossChainRecentTrade(this.trade) &&
      this.trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.ARBITRUM
    );
  }

  public get showAction(): boolean {
    return (
      ((this.isSymbiosisTrade || this.isCbridgeTrade || this.isArbitrumBridgeTrade) &&
        this.uiTrade?.statusTo === this.CrossChainTxStatus.REVERT) ||
      (this.isArbitrumBridgeTrade &&
        this.uiTrade?.statusTo === this.CrossChainTxStatus.READY_TO_CLAIM)
    );
  }

  public get showRevert(): boolean {
    return (
      (this.isSymbiosisTrade || this.isCbridgeTrade || this.isArbitrumBridgeTrade) &&
      this.uiTrade?.statusTo === this.CrossChainTxStatus.REVERT
    );
  }

  public get isCbridgeTrade(): boolean {
    if (!this.isChangenowTrade(this.trade)) {
      return (
        isCrossChainRecentTrade(this.trade) &&
        this.trade.crossChainTradeType === CROSS_CHAIN_TRADE_TYPE.CELER_BRIDGE
      );
    }
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
    if (this.isChangenowTrade(this.trade)) {
      return !this.uiTrade?.statusTo && this.uiTrade?.statusFrom === TxStatus.SUCCESS;
    }

    return (
      isOnramperRecentTrade(this.trade) &&
      !this.uiTrade?.statusTo &&
      this.uiTrade?.statusFrom === TxStatus.SUCCESS
    );
  }

  public get changenowId(): string | undefined {
    if ('changenowId' in this.trade) {
      return this.trade.changenowId;
    }

    if (this.isChangenowTrade(this.trade)) {
      return this.trade.id;
    }

    return undefined;
  }

  public hintShown: boolean;

  constructor(
    private readonly recentTradesStoreService: RecentTradesStoreService,
    private readonly cdr: ChangeDetectorRef,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly recentTradesService: RecentTradesService,
    private readonly tokensService: TokensService,
    private readonly onramperService: OnramperService,
    private readonly swapFormQueryService: SwapFormQueryService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {}

  ngOnInit(): void {
    this.initTradeDataPolling();
  }

  ngOnDestroy(): void {
    this.saveTrades();
  }

  public isChangenowTrade(trade: RecentTrade | ChangenowPostTrade): trade is ChangenowPostTrade {
    return 'id' in trade;
  }

  public getTradeData(trade: RecentTrade | ChangenowPostTrade): Promise<UiRecentTrade> {
    if (this.isChangenowTrade(trade)) {
      return this.recentTradesService.getChangeNowTradeData(trade);
    }

    return this.recentTradesService.getTradeData(trade);
  }

  private initTradeDataPolling(): void {
    interval(30000)
      .pipe(
        startWith(-1),
        switchMap(() => this.getTradeData(this.trade)),
        tap(uiTrade => this.setUiTrade(uiTrade)),
        watch(this.cdr),
        takeWhile(
          uiTrade =>
            uiTrade?.statusTo === TxStatus.PENDING ||
            uiTrade?.statusTo !== ChangenowApiStatus.FINISHED
        ),
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

  public getToStatusBadgeText(status: TxStatus | ChangenowApiStatus): string {
    if (this.isChangenowTrade(this.trade)) {
      return getStatusBadgeText(status);
    }

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
    if (!this.isChangenowTrade(this.trade)) {
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
  }

  public async revertTrade(): Promise<void> {
    if (this.isChangenowTrade(this.trade)) {
      return;
    }
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

    if (this.isArbitrumBridgeTrade) {
      revertTxReceipt = await this.recentTradesService.redeemArbitrum(
        this.trade.srcTxHash,
        this.trade.fromToken.blockchain as ArbitrumRbcBridgeSupportedBlockchain
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
      if (this.isArbitrumBridgeTrade) {
        this.uiTrade.dstTxLink = new ScannerLinkPipe().transform(
          revertTxReceipt.transactionHash,
          this.trade.toToken.blockchain,
          ADDRESS_TYPE.TRANSACTION
        );
      }
      this.cdr.detectChanges();
    }
  }

  public async continueOnramperTrade(): Promise<void> {
    if (this.isChangenowTrade(this.trade)) {
      return;
    }
    if (!isOnramperRecentTrade(this.trade)) {
      return;
    }

    await this.onramperService.updateSwapFormByRecentTrade(this.trade.rubicId);
    this.onClose.emit();
  }

  public onTokenImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(this.changenowId);
  }

  private showHint(): void {
    this.hintShown = true;
    timer(2500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }

  public async claimTokens(): Promise<void> {
    this.revertBtnLoading = true;

    if (this.isChangenowTrade(this.trade)) {
      return;
    }
    if (!isCrossChainRecentTrade(this.trade)) {
      return;
    }

    let revertTxReceipt: TransactionReceipt;

    if (this.isArbitrumBridgeTrade) {
      try {
        revertTxReceipt = await this.recentTradesService.claimArbitrumBridgeTokens(
          this.trade.srcTxHash
        );
        if (revertTxReceipt.status) {
          this.uiTrade.statusTo = TxStatus.SUCCESS;
          this.revertBtnLoading = false;
          this.uiTrade.dstTxHash = revertTxReceipt.transactionHash;
          this.uiTrade.dstTxLink = new ScannerLinkPipe().transform(
            revertTxReceipt.transactionHash,
            this.trade.toToken.blockchain,
            ADDRESS_TYPE.TRANSACTION
          );
          this.trade.calculatedStatusFrom = TxStatus.SUCCESS;
          this.trade.calculatedStatusTo = TxStatus.SUCCESS;
          this.cdr.detectChanges();
        }
      } catch (err) {
        console.debug(err);
      }
    }

    this.revertBtnLoading = false;
    this.cdr.detectChanges();
  }
}
