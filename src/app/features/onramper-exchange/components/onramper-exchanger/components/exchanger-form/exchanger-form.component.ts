import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-exchanger-form',
  templateUrl: './exchanger-form.component.html',
  styleUrls: ['./exchanger-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangerFormComponent {
  @Output() onSwapClick = new EventEmitter<void>();

  public readonly disabled$ = this.exchangerFormService.toAmount$.pipe(
    map(toAmount => !toAmount?.gt(0))
  );

  constructor(public readonly exchangerFormService: ExchangerFormService) {}

  public onSwapClickHandler(): void {
    this.onSwapClick.emit();
  }
}
