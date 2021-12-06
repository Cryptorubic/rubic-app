import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@ngneat/reactive-forms';
import {
  BridgeSettingsForm,
  CcrSettingsForm,
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { filter, first, startWith, takeUntil } from 'rxjs/operators';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { SwapsService } from '@features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';
import { combineLatest } from 'rxjs';

export interface IframeSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

interface SlippageTolerance {
  instantTrades: number;
  crossChain: number;
}

const defaultSlippageTolerance: SlippageTolerance = {
  instantTrades: 2,
  crossChain: 5
};

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class IframeSettingsComponent implements OnInit {
  private defaultSlippageTolerance: SlippageTolerance;

  public iframeSettingsForm: FormGroup<IframeSettingsForm>;

  public slippageTolerance: number;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroy$: TuiDestroyService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapService: SwapsService
  ) {}

  ngOnInit(): void {
    this.queryParamsService.slippage$.pipe(first()).subscribe(({ slippageIt, slippageCcr }) => {
      this.defaultSlippageTolerance = {
        instantTrades: slippageIt ?? defaultSlippageTolerance.instantTrades,
        crossChain: slippageCcr ?? defaultSlippageTolerance.crossChain
      };
      this.setForm();
    });
  }

  private setForm(): void {
    const itSettingsForm = this.settingsService.instantTrade;
    const bridgeSettingsForm = this.settingsService.bridge;
    const ccrSettingsForm = this.settingsService.crossChainRouting;

    const settingsForm =
      this.swapService.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE
        ? itSettingsForm
        : ccrSettingsForm;
    if (settingsForm.value.autoSlippageTolerance) {
      this.setDefaultSlippageBySwapProvider();
    } else {
      this.slippageTolerance = settingsForm.value.slippageTolerance;
    }

    this.iframeSettingsForm = new FormGroup<IframeSettingsForm>({
      autoSlippageTolerance: new FormControl<boolean>(settingsForm.value.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(this.slippageTolerance),
      disableMultihops: new FormControl<boolean>(itSettingsForm.value.disableMultihops),
      rubicOptimisation: new FormControl<boolean>(itSettingsForm.value.rubicOptimisation),
      autoRefresh: new FormControl<boolean>(settingsForm.value.autoRefresh)
    });

    this.setFormChanges(itSettingsForm, bridgeSettingsForm, ccrSettingsForm);
  }

  private setFormChanges(
    itSettingsForm: AbstractControl<ItSettingsForm>,
    bridgeSettingsForm: AbstractControl<BridgeSettingsForm>,
    ccrSettingsForm: AbstractControl<CcrSettingsForm>
  ): void {
    this.iframeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      itSettingsForm.patchValue(settings);
      ccrSettingsForm.patchValue(settings);
    });

    combineLatest([
      itSettingsForm.valueChanges,
      this.swapService.swapMode$.pipe(
        filter(swapMode => swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE)
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([settings]) => {
        this.iframeSettingsForm.patchValue(settings, { emitEvent: false });
        this.slippageTolerance = settings.slippageTolerance;
        ccrSettingsForm.patchValue(settings);
      });

    bridgeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
    });

    combineLatest([
      ccrSettingsForm.valueChanges.pipe(startWith(ccrSettingsForm.value)),
      this.swapService.swapMode$.pipe(
        filter(swapMode => swapMode === SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING)
      )
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([settings]) => {
        this.iframeSettingsForm.patchValue(settings, { emitEvent: false });
        this.slippageTolerance = settings.slippageTolerance;
        itSettingsForm.patchValue(settings);
      });
  }

  public toggleAutoSlippageTolerance(): void {
    if (!this.iframeSettingsForm.value.autoSlippageTolerance) {
      this.setDefaultSlippageBySwapProvider();
      this.iframeSettingsForm.patchValue({
        autoSlippageTolerance: true,
        slippageTolerance: this.slippageTolerance
      });
    } else {
      this.iframeSettingsForm.patchValue({
        autoSlippageTolerance: false
      });
    }
  }

  public onSlippageToleranceChange(slippageTolerance: number): void {
    this.slippageTolerance = slippageTolerance;
    this.iframeSettingsForm.patchValue({
      autoSlippageTolerance: false,
      slippageTolerance: this.slippageTolerance
    });
  }

  public setDefaultSlippageBySwapProvider(): void {
    switch (this.swapService.swapMode) {
      case SWAP_PROVIDER_TYPE.INSTANT_TRADE: {
        this.slippageTolerance = this.defaultSlippageTolerance.instantTrades;
        break;
      }
      case SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING: {
        this.slippageTolerance = this.defaultSlippageTolerance.crossChain;
        break;
      }
      default: {
        this.slippageTolerance = 1;
      }
    }
  }

  // public regulateSlippage(slippage: number) {
  //   if (isNaN(slippage)) {
  //     return
  //   }
  //   if (slippage < 0) {
  //
  //   }
  //   if (slippage > 50) {
  //
  //   }
  // }
}
