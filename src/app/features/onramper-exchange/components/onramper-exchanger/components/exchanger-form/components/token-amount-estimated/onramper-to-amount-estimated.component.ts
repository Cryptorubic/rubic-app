import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';

@Component({
  selector: 'app-onramper-to-amount-estimated',
  templateUrl: './onramper-to-amount-estimated.component.html',
  styleUrls: ['./onramper-to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperToAmountEstimatedComponent {
  @Input() errorText = '';

  public readonly toToken$ = this.exchangerFormService.toToken$;

  public readonly toAmount$ = this.exchangerFormService.toAmount$;

  constructor(private readonly exchangerFormService: ExchangerFormService) {}
}
