import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent {
  public readonly deposits$ = this.service.deposits$;

  constructor(private readonly service: LpProvidingService, private readonly router: Router) {}

  public collectReward(): void {}

  public removeDeposit(): void {}

  public navigateToDepositForm(): void {
    this.router.navigate(['liquidity-providing', 'deposit']);
  }
}
