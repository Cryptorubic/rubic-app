import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { StakingService } from '@features/staking/services/staking.service';
import { map } from 'rxjs/operators';
import { WalletConnectorService } from '@core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';
import { STAKING_CONTRACT_ADDRESS } from '@features/staking/constants/STAKING_CONTRACT_ADDRESS';
import { AuthService } from '@core/services/auth/auth.service';
import { Token } from '@shared/models/tokens/Token';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

enum STAKING_NAV_ENUM {
  STAKE = 0,
  WITHDRAW = 1
}

@Component({
  selector: 'app-staking-container',
  templateUrl: './staking-container.component.html',
  styleUrls: ['./staking-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakingContainerComponent {
  public activeItemIndex = STAKING_NAV_ENUM.STAKE;

  public isLoggedIn$ = this.authService.getCurrentUser();

  public readonly refillTime$ = this.stakingService.refillTime$.pipe(
    map(refillTime => {
      if (!refillTime) {
        return 0;
      }
      const date = new Date(Number(refillTime));
      return { hours: date.getHours(), minutes: date.getMinutes() };
    })
  );

  constructor(
    private readonly router: Router,
    private readonly queryParamsService: QueryParamsService,
    private readonly stakingService: StakingService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly authService: AuthService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public navigateToSwaps(): void {
    this.router.navigate(['/']);
  }

  public async addTokensToWallet(): Promise<void> {
    const xBRBC: Token = {
      symbol: 'xBRBC',
      blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      address: STAKING_CONTRACT_ADDRESS,
      decimals: 18,
      image: `${this.window.location.origin}/assets/images/icons/staking/brbc.svg`,
      rank: 0,
      price: 0,
      usedInIframe: false,
      name: 'Rubic Staking Token'
    };
    await this.walletConnectorService.addToken(xBRBC);
  }
}
