import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Self
} from '@angular/core';
import { TUI_ANIMATIONS_DURATION } from '@taiga-ui/core';
import { map, takeUntil } from 'rxjs/operators';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { CrossChainFormService } from '@features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { ThemeService } from '@core/services/theme/theme.service';
import { HeaderStore } from '@app/core/header/services/header.store';
import { ModalService } from '@app/core/modals/services/modal.service';
import { CrossChainTaggedTrade } from '../../../../models/cross-chain-tagged-trade';

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
  public readonly taggedTrades$ = this.crossChainFormService.taggedTrades$.pipe(
    map(taggedTrades => taggedTrades.filter(taggedTrade => taggedTrade.trade))
  );

  public readonly selectedTrade$ = this.crossChainFormService.selectedTrade$;

  public readonly isReady$ = this.swapFormService.inputValue$.pipe(
    map(
      input =>
        Boolean(input.fromAmount?.isFinite()) && Boolean(input.toToken) && Boolean(input.fromAsset)
    )
  );

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public expanded = false;

  public showTradesList = false;

  public readonly theme$ = this.themeService.theme$;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly crossChainFormService: CrossChainFormService,
    private readonly swapFormService: SwapFormService,
    private readonly headerStore: HeaderStore,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(WINDOW) private readonly window: RubicWindow,
    @Self() protected readonly destroy$: TuiDestroyService,
    private readonly themeService: ThemeService
  ) {
    this.formSubscribe();
  }

  private formSubscribe(): void {
    this.swapFormService.inputValueDistinct$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.expanded = false;
    });
  }

  public handleSelection(): void {
    this.showTradesList = false;
    this.expanded = false;
    this.cdr.detectChanges();
  }

  public toggleExpanded(): void {
    if (this.expanded) {
      this.showTradesList = false;
      setTimeout(() => {
        this.expanded = false;
        this.cdr.detectChanges();
      }, 150);
    } else {
      this.expanded = true;
      this.showTradesList = true;
    }
  }

  public openProvidersList(taggedTrades: CrossChainTaggedTrade[]): void {
    this.modalService
      .openCrossChainProvidersModal({
        taggedTrades
      })
      .subscribe();
  }
}
