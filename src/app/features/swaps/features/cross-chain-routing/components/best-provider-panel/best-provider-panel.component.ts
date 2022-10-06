import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { SmartRouting } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/models/smart-routing.interface';
import { TUI_ANIMATIONS_DURATION, TuiDialogService } from '@taiga-ui/core';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { map, takeUntil } from 'rxjs/operators';
import { CalculatedProvider } from '@features/swaps/features/cross-chain-routing/models/calculated-provider';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { SwapFormService } from '@features/swaps/features/main-form/services/swap-form-service/swap-form.service';

@Component({
  selector: 'app-best-provider-panel',
  templateUrl: './best-provider-panel.component.html',
  styleUrls: ['./best-provider-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TUI_ANIMATIONS_DURATION,
      useFactory: () => 10000
    }
  ]
})
export class BestProviderPanelComponent {
  @Input() public calculatedProvider: CalculatedProvider | null;

  @Input() public smartRouting: SmartRouting = null;

  public readonly calculatedProviders$ = this.crossChainRoutingService.allProviders$.pipe(
    map(providers => providers.data.filter(provider => Boolean(provider.trade)).length)
  );

  public expanded = false;

  constructor(
    private readonly dialogService: TuiDialogService,
    private readonly crossChainRoutingService: CrossChainRoutingService,
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly cdr: ChangeDetectorRef,
    private readonly formService: SwapFormService,
    @Inject(TuiDestroyService) protected readonly destroy$: TuiDestroyService
  ) {
    this.formSubscribe();
  }

  private formSubscribe(): void {
    this.formService.inputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.expanded = false;
    });
  }

  public handleSelection(): void {
    this.expanded = false;
    this.cdr.detectChanges();
  }
}
