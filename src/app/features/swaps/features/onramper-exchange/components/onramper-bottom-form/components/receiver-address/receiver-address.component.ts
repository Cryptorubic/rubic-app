import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { nativeTokensList } from 'rubic-sdk';
import { WindowWidthService } from '@core/services/widnow-width-service/window-width.service';
import { WindowSize } from '@core/services/widnow-width-service/models/window-size';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-receiver-address',
  templateUrl: './receiver-address.component.html',
  styleUrls: ['./receiver-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReceiverAddressComponent {
  public readonly nativeTokenSymbol$ = this.swapFormService.toToken$.pipe(
    map(toToken => (toToken ? nativeTokensList[toToken.blockchain].symbol : null))
  );

  public readonly walletAddressText$ = combineLatest([
    this.windowWidthService.windowSize$,
    this.authService.currentUser$
  ]).pipe(
    map(([windowSize, user]) => {
      const walletAddress = user?.address;
      if (!walletAddress) {
        return null;
      }
      if (windowSize <= WindowSize.MOBILE_MD_MINUS) {
        return walletAddress.slice(0, 5) + '...' + walletAddress.slice(walletAddress.length - 4);
      }
      return walletAddress;
    })
  );

  constructor(
    private readonly authService: AuthService,
    private readonly swapFormService: SwapFormService,
    private readonly windowWidthService: WindowWidthService
  ) {}
}
