import { inject, Injectable } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokensBalanceService } from '@app/core/services/tokens/tokens-balance.service';
import { PRIVATE_MODE_SUPPORTED_TOKENS } from '@app/features/privacy/constants/private-mode-supported-tokens';
import { compareAddresses } from '@app/shared/utils/utils';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { distinctUntilChanged } from 'rxjs';

@Injectable()
export class ClearswapBalancesService {
  private readonly authService = inject(AuthService);

  private readonly tokensBalanceService = inject(TokensBalanceService);

  public subscribeOnWallet(): void {
    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((oldValue, newValue) =>
          compareAddresses(oldValue?.address, newValue?.address)
        )
      )
      .subscribe(user => {
        if (user?.address && user?.chainType === BLOCKCHAIN_NAME.TRON) {
          Promise.all(
            PRIVATE_MODE_SUPPORTED_TOKENS[BLOCKCHAIN_NAME.TRON].map(tokenAddress => {
              return this.tokensBalanceService.getAndUpdateTokenBalance(
                { address: tokenAddress, blockchain: BLOCKCHAIN_NAME.TRON },
                20
              );
            })
          );
        }
      });
  }
}
