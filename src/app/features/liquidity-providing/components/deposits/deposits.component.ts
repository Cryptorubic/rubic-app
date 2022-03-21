import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingNotificationsService } from '../../services/liquidity-providing-notifications.service';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent {
  public readonly isWhitelistUser$ = this.service.isWhitelistUser$;

  public readonly deposits$ = this.service.deposits$;

  public readonly depositsLoading$ = this.service.depositsLoading$;

  private readonly _collectingRewardsForToken$ = new BehaviorSubject<string>(undefined);

  public readonly collectingRewardsForToken$ = this._collectingRewardsForToken$.asObservable();

  private readonly _requestingWithdrawForToken$ = new BehaviorSubject<string>(undefined);

  public readonly requestingWithdrawForToken$ = this._requestingWithdrawForToken$.asObservable();

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly router: Router,
    private readonly notificationsService: LiquidityProvidingNotificationsService
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

  public navigateToDepositForm(asWhitelist: boolean): void {
    this.service.navigateToDepositForm(asWhitelist ? DepositType.WHITELIST : DepositType.REGULAR);
  }
}
