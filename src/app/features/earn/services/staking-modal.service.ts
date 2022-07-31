import { Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { NewPositionModalComponent } from '../components/new-position-modal/new-position-modal.component';
import { WithdrawModalComponent } from '../components/withdraw-modal/withdraw-modal.component';
import { ClaimModalComponent } from '../components/claim-modal/claim-modal.component';

@Injectable()
export class StakingModalService {
  constructor(private readonly dialogService: TuiDialogService) {}

  public showDepositModal(
    amount: BigNumber,
    duration: number,
    unlockDate: number
  ): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(NewPositionModalComponent), {
      closeable: false,
      size: 'm',
      data: {
        amount,
        duration,
        unlockDate
      }
    });
  }

  public showWithdrawModal(
    amount: BigNumber,
    needSwitchNetwork$: Observable<boolean>
  ): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(WithdrawModalComponent), {
      closeable: false,
      size: 'm',
      data: {
        amount,
        needSwitchNetwork$
      }
    });
  }

  public showClaimModal(
    rewards: BigNumber,
    needSwitchNetwork$: Observable<boolean>
  ): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(ClaimModalComponent), {
      closeable: false,
      size: 'm',
      data: { rewards, needSwitchNetwork$ }
    });
  }
}
