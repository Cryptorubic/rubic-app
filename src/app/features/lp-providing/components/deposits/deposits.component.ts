import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LpProvidingNotificationsService } from '../../services/lp-providing-notifications.service';
import { LpProvidingService } from '../../services/lp-providing.service';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent {
  public readonly deposits$ = this.service.deposits$;

  public readonly depositsLoading$ = this.service.depositsLoading$;

  private readonly _collectingRewardsForToken$ = new BehaviorSubject<string>(undefined);

  public readonly collectingRewardsForToken$ = this._collectingRewardsForToken$.asObservable();

  private readonly _requestingWithdrawForToken$ = new BehaviorSubject<string>(undefined);

  public readonly requestingWithdrawForToken$ = this._requestingWithdrawForToken$.asObservable();

  constructor(
    private readonly service: LpProvidingService,
    private readonly router: Router,
    private readonly notificationsService: LpProvidingNotificationsService
  ) {}

  public collectReward(tokenId: string): void {
    this._collectingRewardsForToken$.next(tokenId);
    this.service
      .collectRewards(tokenId)
      .pipe(
        finalize(() => {
          this._collectingRewardsForToken$.next(undefined);
        })
      )
      .subscribe(() => {
        this.service.setDepositsLoading(false);
        this.notificationsService.showSuccessRewardsClaimNotification();
      });
  }

  public removeDeposit(tokenId: string): void {
    this._requestingWithdrawForToken$.next(tokenId);
    this.service
      .requestWithdraw(tokenId)
      .pipe(
        finalize(() => {
          this._requestingWithdrawForToken$.next(undefined);
        })
      )
      .subscribe(() => {
        this.notificationsService.showSuccessWithdrawRequestNotification();
      });
  }

  public navigateToDepositForm(): void {
    this.router.navigate(['liquidity-providing', 'deposit']);
  }
}
