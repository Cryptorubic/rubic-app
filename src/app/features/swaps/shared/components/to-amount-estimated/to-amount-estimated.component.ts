import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { SwapsFormService } from '@features/swaps/core/services/swaps-form-service/swaps-form.service';

@Component({
  selector: 'app-to-amount-estimated',
  templateUrl: './to-amount-estimated.component.html',
  styleUrls: ['./to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToAmountEstimatedComponent {
  @Input() errorText = '';

  public readonly formData$ = this.swapsFormService.inputValue$;

  public readonly isFormFilled$ = this.swapsFormService.isFilled$;

  public readonly toAmount$ = this.swapsFormService.outputValue$.pipe(
    map(form => (form.toAmount?.isFinite() ? BigNumber.max(0, form.toAmount) : null))
  );

  constructor(private readonly swapsFormService: SwapsFormService) {}
}
