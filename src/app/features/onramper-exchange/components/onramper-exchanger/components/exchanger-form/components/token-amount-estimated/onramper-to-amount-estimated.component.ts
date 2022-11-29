import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { OnramperCalculationService } from '@features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';

@Component({
  selector: 'app-onramper-to-amount-estimated',
  templateUrl: './onramper-to-amount-estimated.component.html',
  styleUrls: ['./onramper-to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperToAmountEstimatedComponent {
  public readonly toToken$ = this.exchangerFormService.toToken$;

  public readonly toAmount$ = this.exchangerFormService.toAmount$;

  public readonly loading$ = this.onramperCalculationService.loading$;

  public readonly error$ = this.onramperCalculationService.error$;

  constructor(
    private readonly exchangerFormService: ExchangerFormService,
    private readonly onramperCalculationService: OnramperCalculationService
  ) {}
}
