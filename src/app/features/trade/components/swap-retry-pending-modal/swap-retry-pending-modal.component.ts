import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Inject, Self } from '@angular/core';
import { CrossChainTradeType } from '@app/core/services/sdk/sdk-legacy/features/cross-chain/calculation-manager/models/cross-chain-trade-type';
import { BRIDGE_PROVIDERS } from '@app/features/trade/constants/bridge-providers';
import { ON_CHAIN_PROVIDERS } from '@app/features/trade/constants/on-chain-providers';
import { TradeState } from '@app/features/trade/models/trade-state';
import { OnChainTradeType } from '@cryptorubic/core/src/lib/providers/on-chain-trade-type';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { interval, map, Observable, startWith, takeUntil } from 'rxjs';

@Component({
  selector: 'app-swap-retry-pending-modal',
  templateUrl: './swap-retry-pending-modal.component.html',
  styleUrls: ['./swap-retry-pending-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [
    trigger('inOutAnimation', [
      transition('* <=> *', [
        query(
          ':enter',
          [style({ opacity: 0 }), stagger(10, animate('0.5s ease-out', style({ opacity: 1 })))],
          { optional: true }
        ),
        query(
          ':leave',
          [style({ opacity: 1 }), stagger(10, animate('0.5s ease-out', style({ opacity: 0 })))],
          { optional: true }
        )
      ])
    ])
  ]
})
export class SwapRetryPendingModalComponent {
  private readonly SLIDE_UPDATE_INTERVAL: number = 5000;

  public readonly backups$: Observable<TradeState[]>;

  public readonly isFirstSlide$: Observable<boolean>;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { backups$: Observable<TradeState[]> }>,
    @Self() private readonly destroyed$: TuiDestroyService
  ) {
    this.backups$ = context.data.backups$;
    this.isFirstSlide$ = this.getToggle();
  }

  public getCurrentBackupProviderName(allBackups: TradeState[]): string {
    const defaultResult = 'unknown';
    const currentBackup = this.getCurrentBackup(allBackups);

    if (currentBackup === null) {
      return defaultResult;
    }

    return (
      ON_CHAIN_PROVIDERS[currentBackup.tradeType as OnChainTradeType]?.name ||
      BRIDGE_PROVIDERS[currentBackup.tradeType as CrossChainTradeType]?.name ||
      defaultResult
    );
  }

  public getCurrentBackup(allBackups: TradeState[]): TradeState | null {
    if (allBackups.length > 1) {
      return allBackups[0];
    }

    return null;
  }

  private getToggle(): Observable<boolean> {
    return interval(this.SLIDE_UPDATE_INTERVAL).pipe(
      map(count => count % 2 === 0),
      startWith(true),
      takeUntil(this.destroyed$)
    );
  }
}
