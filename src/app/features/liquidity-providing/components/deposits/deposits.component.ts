import { ChangeDetectionStrategy, Component } from '@angular/core';
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

  private readonly _processingTokenId$ = new BehaviorSubject<string>(undefined);

  public readonly processingTokenId$ = this._processingTokenId$.asObservable();

  constructor(
    private readonly service: LiquidityProvidingService,
    private readonly notificationsService: LiquidityProvidingNotificationsService
  ) {}

  public collectReward(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.service
      .collectRewards(tokenId)
      .pipe(
        finalize(() => {
          this._processingTokenId$.next(undefined);
        })
      )
      .subscribe(() => {
        this.service.setDepositsLoading(false);
        this.notificationsService.showSuccessRewardsClaimNotification();
      });
  }

  public requestWithdraw(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.service
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
    this.service.navigateToDepositForm(asWhitelist ? DepositType.WHITELIST : DepositType.REGULAR);
  }
}
