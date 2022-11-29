import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { OnramperApiService } from '@features/onramper-exchange/services/onramper-widget-service/onramper-api.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-exchanger-form',
  templateUrl: './exchanger-form.component.html',
  styleUrls: ['./exchanger-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangerFormComponent {
  public toAmount: BigNumber;

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly onramperApiService: OnramperApiService
  ) {
    this.onramperApiService.getOutputNativeTokenAmount().then(toAmount => {
      this.toAmount = toAmount;
    });
  }
}
