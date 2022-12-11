import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { nativeTokensList } from 'rubic-sdk';

@Component({
  selector: 'app-receiver-address',
  templateUrl: './receiver-address.component.html',
  styleUrls: ['./receiver-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressComponent {
  public readonly walletAddress$ = this.authService.currentUser$.pipe(map(user => user?.address));

  public readonly nativeTokenSymbol$ = this.swapFormService.toToken$.pipe(
    map(toToken => (toToken ? nativeTokensList[toToken.blockchain].symbol : null))
  );

  constructor(
    private readonly authService: AuthService,
    private readonly swapFormService: SwapFormService
  ) {}
}
