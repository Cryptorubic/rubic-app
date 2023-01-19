import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  Self
} from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { SettingsService } from '@features/swaps/core/services/settings-service/settings.service';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class IframeSettingsComponent {
  private readonly settingsService = this.context.content.injector.get(SettingsService);

  private readonly swapService = this.context.content.injector.get(SwapTypeService);

  private readonly cdr = this.context.content.injector.get(ChangeDetectorRef);

  private get form(): FormGroup {
    return this.swapService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
      ? this.onChainForm
      : this.crossChainForm;
  }

  public readonly onChainForm = this.settingsService.instantTrade;

  public readonly crossChainForm = this.settingsService.crossChainRouting;

  public readonly isCrossChain =
    this.swapService.swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) readonly context: { content: { injector: Injector } },
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.form.controls.slippageTolerance.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.form.getRawValue().autoSlippageTolerance) {
          this.form.patchValue({
            autoSlippageTolerance: false
          });
        }
      });
  }

  public toggleAutoSlippageTolerance(): void {
    const autoSlippage = this.form.getRawValue().autoSlippageTolerance;
    if (autoSlippage) {
      this.form.patchValue({
        autoSlippageTolerance: false
      });
    } else {
      this.form.patchValue({
        autoSlippageTolerance: true
      });
    }
    this.cdr.detectChanges();
  }
}
