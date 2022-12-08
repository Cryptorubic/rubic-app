import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';

@Component({
  selector: 'app-swap-bottom-form',
  templateUrl: './swap-bottom-form.component.html',
  styleUrls: ['./swap-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapBottomFormComponent {
  @Output() onSwapClick = new EventEmitter<void>();

  public readonly user$ = this.authService.currentUser$;

  constructor(
    private readonly onramperCalculationService: OnramperCalculationService,
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
