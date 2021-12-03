import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@ngneat/reactive-forms';
import {
  BridgeSettingsForm,
  CcrSettingsForm,
  ItSettingsForm,
  SettingsService
} from 'src/app/features/swaps/services/settings-service/settings.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { first, takeUntil } from 'rxjs/operators';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { SwapsService } from '@features/swaps/services/swaps-service/swaps.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/models/SwapProviderType';

export interface IframeSettingsForm {
  autoSlippageTolerance: boolean;
  slippageTolerance: number;
  disableMultihops: boolean;
  rubicOptimisation: boolean;
  autoRefresh: boolean;
}

@Component({
  selector: 'app-iframe-settings',
  templateUrl: './iframe-settings.component.html',
  styleUrls: ['./iframe-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class IframeSettingsComponent implements OnInit {
  private defaultSlippageToleranceIT = 2;

  private defaultSlippageToleranceCcr = 5;

  public iframeSettingsForm: FormGroup<IframeSettingsForm>;

  public slippageTolerance: number;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly destroy$: TuiDestroyService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapService: SwapsService
  ) {}

  ngOnInit(): void {
    this.queryParamsService.slippage$
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe(({ slippageIt, slippageCcr }) => {
        this.defaultSlippageToleranceIT = slippageIt ?? this.defaultSlippageToleranceIT;
        this.defaultSlippageToleranceCcr = slippageCcr ?? this.defaultSlippageToleranceCcr;
        this.setForm();
      });
  }

  private setForm(): void {
    const itSettingsForm = this.settingsService.instantTrade;
    const bridgeSettingsForm = this.settingsService.bridge;
    const ccrSettingsForm = this.settingsService.crossChainRouting;

    this.setDefaultSlippageBySwapProvider();

    this.iframeSettingsForm = new FormGroup<IframeSettingsForm>({
      autoSlippageTolerance: new FormControl<boolean>(itSettingsForm.value.autoSlippageTolerance),
      slippageTolerance: new FormControl<number>(this.slippageTolerance),
      disableMultihops: new FormControl<boolean>(itSettingsForm.value.disableMultihops),
      rubicOptimisation: new FormControl<boolean>(itSettingsForm.value.rubicOptimisation),
      autoRefresh: new FormControl<boolean>(itSettingsForm.value.autoRefresh)
    });
    this.setFormChanges(itSettingsForm, bridgeSettingsForm, ccrSettingsForm);
  }

  private setFormChanges(
    itSettingsForm: AbstractControl<ItSettingsForm>,
    bridgeSettingsForm: AbstractControl<BridgeSettingsForm>,
    ccrSettingsForm: AbstractControl<CcrSettingsForm>
  ): void {
    this.iframeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      const { ...itSettings } = settings;
      itSettingsForm.patchValue({ ...itSettings });
      ccrSettingsForm.patchValue({ ...itSettings });
    });

    itSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
      ccrSettingsForm.patchValue({ slippageTolerance: settings.slippageTolerance });
    });

    bridgeSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
    });

    ccrSettingsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(settings => {
      this.iframeSettingsForm.patchValue({ ...settings }, { emitEvent: false });
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
        this.slippageTolerance = this.defaultSlippageToleranceIT;
        break;
      }
      case SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING: {
        this.slippageTolerance = this.defaultSlippageToleranceCcr;
        break;
      }
      default: {
        this.slippageTolerance = 1;
      }
    }
  }
}
