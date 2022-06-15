import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { StatusBadgeType } from '@app/shared/components/status-badge/status-badge.component';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';
import { RecentTradeStatus } from '../../models/recent-trade-status.enum';
import { RecentTradesService } from '../../services/recent-trades.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { BehaviorSubject, takeUntil, tap } from 'rxjs';
import { BlockchainName } from '@app/shared/models/blockchain/blockchain-name';

const STATUS_BADGE_TYPE: Partial<Record<RecentTradeStatus, StatusBadgeType>> = {
  [RecentTradeStatus.FAIL]: 'error',
  [RecentTradeStatus.PENDING]: 'info',
  [RecentTradeStatus.SUCCESS]: 'active',
  [RecentTradeStatus.FALLBACK]: 'info'
};

const STATUS_BADGE_TEXT: Partial<Record<RecentTradeStatus, string>> = {
  [RecentTradeStatus.FAIL]: 'Fail',
  [RecentTradeStatus.PENDING]: 'Pending',
  [RecentTradeStatus.SUCCESS]: 'Success',
  [RecentTradeStatus.FALLBACK]: 'Fallback'
};

@Component({
  selector: 'app-recent-crosschain-tx',
  templateUrl: './recent-crosschain-tx.component.html',
  styleUrls: ['./recent-crosschain-tx.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentCrosschainTxComponent implements OnInit, OnDestroy {
  private readonly _initialLoading$ = new BehaviorSubject<boolean>(true);

  public readonly initialLoading$ = this._initialLoading$.asObservable();

  public readonly recentTrades$ = this.recentTradesService.usersTrades$.pipe(
    tap(() => {
      if (this._initialLoading$.getValue()) {
        setTimeout(() => {
          this._initialLoading$.next(false);
          this.cdr.detectChanges();
        }, 1000);
      }
    })
  );

  public readonly ADDRESS_TYPE = ADDRESS_TYPE;

  public readonly RecentTradeStatus = RecentTradeStatus;

  public readonly STATUS_BADGE_TYPE = STATUS_BADGE_TYPE;

  public readonly STATUS_BADGE_TEXT = STATUS_BADGE_TEXT;

  public readonly isMobile = this.recentTradesService.isMobile;

  constructor(
    private readonly recentTradesService: RecentTradesService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    @Inject(TuiDestroyService) private readonly destroy$: TuiDestroyService,
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TuiDialogContext
  ) {}

  public ngOnInit(): void {
    this.recentTradesService.readAllTrades();
    this.recentTradesService.initStatusPolling().pipe(takeUntil(this.destroy$)).subscribe();
    this.recentTradesService
      .loadSymbiosisPendingRequests()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  public navigateToCrossChainSwaps(): void {
    this.router.navigate(['/swaps']).then(() => this.context.completeWith(null));
  }

  public async revertSymbiosis(srcTxHash: string, fromBlockchain: BlockchainName): Promise<void> {
    await this.recentTradesService.revertSymbiosis(srcTxHash, fromBlockchain);
  }

  public ngOnDestroy(): void {
    this.recentTradesService.resetTrades();
  }
}
