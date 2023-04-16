import { ChangeDetectionStrategy, Component } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form.service';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';

@Component({
  selector: 'app-onramper-bottom-form',
  templateUrl: './onramper-bottom-form.component.html',
  styleUrls: ['./onramper-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperBottomFormComponent {
  public readonly tradeStatus$ = this.onramperFormCalculationService.tradeStatus$.pipe(
    debounceTime(200)
  );

  public readonly tradeError$ = this.onramperFormCalculationService.tradeError$;

  constructor(
    private readonly onramperFormService: OnramperFormService,
    private readonly onramperFormCalculationService: OnramperFormCalculationService
  ) {}

  public onUpdateRate(): void {
    this.onramperFormCalculationService.updateRate();
  }

  public handleDirectBuy(): void {
    this.onramperFormService.widgetOpened = true;
  }
}
