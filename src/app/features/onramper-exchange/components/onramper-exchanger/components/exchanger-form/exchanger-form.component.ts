import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';

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

  public readonly user$ = this.authService.currentUser$;

  constructor(
    public readonly exchangerFormService: ExchangerFormService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService
  ) {}

  public onConnectWallet(): void {
    this.walletsModalService.open().subscribe();
  }

  public onSwapClickHandler(): void {
    this.onSwapClick.emit();
  }
}
