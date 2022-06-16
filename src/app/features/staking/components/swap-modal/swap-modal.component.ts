import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiNotification } from '@taiga-ui/core';
import { Router } from '@angular/router';
import BigNumber from 'bignumber.js';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BlockchainName, BLOCKCHAIN_NAME } from 'rubic-sdk';
import { StakingService } from '@features/staking/services/staking.service';

/**
 * The modal which allows user to choose staking method.
 */
@Component({
  selector: 'app-swap-modal',
  templateUrl: './swap-modal.component.html',
  styleUrls: ['./swap-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapModalComponent {
  private readonly _bridgeSwapButtonLoading$ = new BehaviorSubject<boolean>(false);

  get bridgeSwapButtonLoading$(): Observable<boolean> {
    return this._bridgeSwapButtonLoading$.asObservable();
  }

  public isEthBlockchain: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; blockchain: BlockchainName }
    >,
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly notificationsService: NotificationsService
  ) {
    this.isEthBlockchain = this.context.data.blockchain === BLOCKCHAIN_NAME.ETHEREUM;
  }

  public navigateToSwaps(): void {
    this.router.navigate(['/swaps']).then(() => this.context.completeWith(false));
  }

  public swapViaPlatform(): void {
    this.notificationsService.show('Staking is disabled due to Staking contract is full.', {
      status: TuiNotification.Warning,
      autoClose: 10000
    });
    // if (this.stakingService.stakingRound === 1) {
    //   this.notificationsService.show('Staking is disabled due to Staking contract is full.', {
    //     status: TuiNotification.Warning,
    //     autoClose: 10000
    //   });
    // } else {
    //   this._bridgeSwapButtonLoading$.next(true);
    //   this.context.completeWith(false);
    //   this.stakingService.stakingProgress$
    //     .pipe(
    //       switchMap(stakingProgress => {
    //         return stakingProgress.totalRbcEntered > 6_000_000
    //           ? of(false)
    //           : this.stakingService.enterStakeViaBridge(this.context.data.amount).pipe(
    //               map(() => true),
    //               finalize(() => this._bridgeSwapButtonLoading$.next(false))
    //             );
    //       })
    //     )
    //     .subscribe(allowBridge => {
    //       if (allowBridge) {
    //         this.context.completeWith(false);
    //         this.notificationsService.show('Staking', {
    //           label: 'The transaction was successful',
    //           status: TuiNotification.Success,
    //           autoClose: 5000
    //         });
    //       } else {
    //         this.notificationsService.show('Staking is disabled due to Staking contract is full.', {
    //           status: TuiNotification.Warning,
    //           autoClose: 10000
    //         });
    //       }
    //     });
    // }
  }
}
