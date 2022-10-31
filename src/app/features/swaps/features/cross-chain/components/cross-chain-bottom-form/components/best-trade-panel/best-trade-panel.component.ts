import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Self } from '@angular/core';
import { TUI_ANIMATIONS_DURATION } from '@taiga-ui/core';
import { map, takeUntil } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';

@Component({
  selector: 'app-best-trade-panel',
  templateUrl: './best-trade-panel.component.html',
  styleUrls: ['./best-trade-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_ANIMATIONS_DURATION,
      useFactory: () => 10000
    },
    TuiDestroyService
  ]
})
export class BestTradePanelComponent {
  public readonly trades$ = this.crossChainFormService.taggedTrades$.pipe(
    map(taggedTrades => taggedTrades.filter(taggedTrade => taggedTrade.trade))
  );

  public readonly selectedTrade$ = this.crossChainFormService.selectedTrade$;

  public expanded = false;

  public showProviders = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly formService: SwapFormService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Self() protected readonly destroy$: TuiDestroyService
  ) {
    this.formSubscribe();
  }

  private formSubscribe(): void {
    this.formService.inputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.expanded = false;
    });
  }

  public handleSelection(): void {
    this.showProviders = false;
    this.expanded = false;
    this.cdr.detectChanges();
  }

  public toggleExpanded(): void {
    if (this.expanded) {
      this.showProviders = false;
      setTimeout(() => {
        this.expanded = false;
        this.cdr.detectChanges();
      }, 150);
    } else {
      this.expanded = true;
      this.showProviders = true;
    }
  }
}
