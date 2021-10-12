import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { TradeData } from 'src/app/features/instant-trade/components/provider-panel/models/trade-data';
import { ProviderData } from 'src/app/features/instant-trade/components/provider-panel/models/provider-data';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { Observable } from 'rxjs';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { shouldDisplayGas } from 'src/app/features/instant-trade/constants/shouldDisplayGas';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelContentComponent {
  @Input() public tradeData: TradeData;

  @Input() public providerData: ProviderData;

  public blockchains = BLOCKCHAIN_NAME;

  public swapFormData: Observable<SwapFormInput>;

  public displayGas: boolean;

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.swapFormService.inputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(formData => {
      this.displayGas = shouldDisplayGas[formData.fromBlockchain as keyof typeof shouldDisplayGas];
      this.cdr.detectChanges();
    });
  }
}
