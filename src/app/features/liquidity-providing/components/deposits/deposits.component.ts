import { ChangeDetectionStrategy, Component } from '@angular/core';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { DepositType } from '../../models/deposit-type.enum';
import { LiquidityProvidingModalService } from '../../services/liquidity-providing-modals.service';
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
    private readonly notificationsService: LiquidityProvidingNotificationService,
    private readonly modalService: LiquidityProvidingModalService
  ) {}

  public collectReward(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.lpService
      .collectRewards(tokenId)
      .pipe(
        switchMap(() => this.lpService.getStatistics()),
        finalize(() => this._processingTokenId$.next(undefined))
      )
      .subscribe(() => {
        this._processingTokenId$.next(undefined);
        this.lpService.setDepositsLoading(false);
        this.notificationsService.showSuccessRewardsClaimNotification();
      });
  }

  public requestWithdraw(tokenId: string, amount: BigNumber): void {
    of(this.lpService.isLpEneded)
      .pipe(
        switchMap(isLpEnded => {
          if (isLpEnded) {
            return this.lpService.requestWithdraw(tokenId).pipe(
              finalize(() => {
                this.notificationsService.showSuccessWithdrawRequestNotification();
                this._processingTokenId$.next(undefined);
              })
            );
          } else {
            return this.modalService.showRequestWithdrawModal(amount).pipe(
              switchMap(result => {
                if (result) {
                  this._processingTokenId$.next(tokenId);
                  return this.lpService.requestWithdraw(tokenId).pipe(
                    finalize(() => {
                      this.notificationsService.showSuccessWithdrawRequestNotification();
                      this._processingTokenId$.next(undefined);
                    })
                  );
                } else {
                  return of(result);
                }
              })
            );
          }
        })
      )
      .subscribe();
  }

  public withdraw(tokenId: string): void {
    this._processingTokenId$.next(tokenId);
    this.lpService
      .withdraw(tokenId)
      .pipe(finalize(() => this._processingTokenId$.next(undefined)))
      .subscribe(() => {
        this.notificationsService.showSuccessWithdrawNotification();
      });
  }

  public navigateToDepositForm(asWhitelist: boolean): void {
    this.lpService.navigateToDepositForm(asWhitelist ? DepositType.WHITELIST : DepositType.REGULAR);
  }
}
