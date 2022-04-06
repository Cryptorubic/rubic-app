import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingNotificationService } from '../../services/liquidity-providing-notification.service';
import { LiquidityProvidingService } from '../../services/liquidity-providing.service';

@Component({
  selector: 'app-deposits',
  templateUrl: './deposits.component.html',
  styleUrls: ['./deposits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositsComponent {
  public readonly isWhitelistUser$ = this.lpService.isWhitelistUser$;

  public readonly deposits$ = this.lpService.deposits$;

  public readonly depositsLoading$ = this.lpService.depositsLoading$;

  private readonly _processingTokenId$ = new BehaviorSubject<string>(undefined);

  public readonly processingTokenId$ = this._processingTokenId$.asObservable();

  constructor(
    private readonly lpService: LiquidityProvidingService,
    private readonly notificationsService: LiquidityProvidingNotificationService
  ) {}

  public collectReward(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.lpService
      .collectRewards(tokenId)
      .pipe(switchMap(() => this.lpService.getStatistics()))
      .subscribe(() => {
        this._processingTokenId$.next(undefined);
        this.lpService.setDepositsLoading(false);
        this.notificationsService.showSuccessRewardsClaimNotification();
      });
  }

  public requestWithdraw(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.lpService
      .requestWithdraw(tokenId)
      .pipe(
        finalize(() => {
          this._processingTokenId$.next(undefined);
        })
      )
      .subscribe(() => {
        this.notificationsService.showSuccessWithdrawRequestNotification();
      });
  }

  public withdraw(tokenId: string): void {
    console.log(tokenId);
  }

  public navigateToDepositForm(asWhitelist: boolean): void {
    this.lpService.navigateToDepositForm(asWhitelist ? DepositType.WHITELIST : DepositType.REGULAR);
  }
}
