import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { ErrorsService } from '@core/errors/errors.service';
import { RubicError } from '@core/errors/models/rubic-error';

@Component({
  selector: 'app-onramper-exchanger',
  templateUrl: './onramper-exchanger.component.html',
  styleUrls: ['./onramper-exchanger.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnramperExchangerComponent {
  public isWidgetOpened = false;

  constructor(
    private readonly authService: AuthService,
    private readonly errorsService: ErrorsService
  ) {}

  public onSwapClick(): void {
    if (!this.authService.userAddress) {
      this.errorsService.catch(new RubicError('Connect wallet!'));
    } else {
      this.isWidgetOpened = true;
    }
  }
}
