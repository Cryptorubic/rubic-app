import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-lp-landing',
  templateUrl: './lp-landing.component.html',
  styleUrls: ['./lp-landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpLandingComponent {
  public readonly needLogin$ = this.service.needLogin$;

  public readonly isWhitelistUser$ = this.service.isWhitelistUser$;

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly router: Router
  ) {}

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToDepositForm(asWhitelist: boolean): void {
    this.service.navigateToDepositForm(asWhitelist ? DepositType.WHITELIST : DepositType.REGULAR);
  }
}
