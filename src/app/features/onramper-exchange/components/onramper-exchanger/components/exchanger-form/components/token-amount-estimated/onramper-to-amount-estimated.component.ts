import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';

@Component({
  selector: 'app-onramper-to-amount-estimated',
  templateUrl: './onramper-to-amount-estimated.component.html',
  styleUrls: ['./onramper-to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperToAmountEstimatedComponent {
  @Input() toAmount: BigNumber;

  @Input() errorText = '';

  public readonly toToken$ = this.exchangerFormService.toToken$;

  constructor(private readonly exchangerFormService: ExchangerFormService) {}
}
