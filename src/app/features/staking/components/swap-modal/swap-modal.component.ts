import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext, TuiDialogService, TuiNotification } from '@taiga-ui/core';
import { Router } from '@angular/router';
import { StakingService } from '@features/staking/services/staking.service';
import BigNumber from 'bignumber.js';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-swap-modal',
  templateUrl: './swap-modal.component.html',
  styleUrls: ['./swap-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SwapModalComponent {
  public readonly bridgeSwapButtonLoading$ = new BehaviorSubject<boolean>(false);

  public isEthBlockchain: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; blockchain: BLOCKCHAIN_NAME }
    >,
    private readonly router: Router,
    private readonly stakingService: StakingService,
    private readonly dialogService: TuiDialogService,
    private readonly notificationsService: NotificationsService
  ) {
    this.isEthBlockchain = this.context.data.blockchain === BLOCKCHAIN_NAME.ETHEREUM;
  }

  public navigateToSwaps(): void {
    this.router.navigate(['/swaps']).then(() => this.context.completeWith(false));
  }

  public swapViaPlatform(): void {
    this.bridgeSwapButtonLoading$.next(true);
    this.stakingService
      .enterStakeViaBridge(this.context.data.amount)
      .pipe(finalize(() => this.bridgeSwapButtonLoading$.next(false)))
      .subscribe(() => {
        this.context.completeWith(false);
        this.notificationsService.show('Staking', {
          label: 'The transaction was successful',
          status: TuiNotification.Success,
          autoClose: 5000
        });
      });
  }
}
