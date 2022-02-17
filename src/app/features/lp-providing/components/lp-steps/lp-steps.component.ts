import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletsModalService } from '@app/core/wallets/services/wallets-modal.service';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-lp-steps',
  templateUrl: './lp-steps.component.html',
  styleUrls: ['./lp-steps.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LpStepsComponent {
  public readonly needLogin$ = this.service.needLogin$;

  constructor(
    private readonly service: LpProvidingService,
    private readonly walletsModalService: WalletsModalService,
    private readonly router: Router
  ) {}

  public login(): void {
    this.walletsModalService.open().subscribe();
  }

  public navigateToDepositForm(): void {
    this.router.navigate(['liquidity-providing', 'deposit']);
  }
}
