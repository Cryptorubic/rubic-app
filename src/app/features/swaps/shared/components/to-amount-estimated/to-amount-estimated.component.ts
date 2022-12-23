import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';

@Component({
  selector: 'app-to-amount-estimated',
  templateUrl: './to-amount-estimated.component.html',
  styleUrls: ['./to-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToAmountEstimatedComponent {
  @Input() errorText = '';

  public readonly formData$ = this.swapFormService.inputValue$;

  public readonly isFormFilled$ = this.swapFormService.isFilled$;

  public readonly toAmount$ = this.swapFormService.outputValue$.pipe(
    map(form => (form.toAmount?.isFinite() ? BigNumber.max(0, form.toAmount) : null))
  );

  constructor(private readonly swapFormService: SwapFormService) {}
}
