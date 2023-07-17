import { Injectable } from '@angular/core';
import { TuiDialogSize } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { NewPositionModalComponent } from '../components/new-position-modal/new-position-modal.component';
import { WithdrawModalComponent } from '../components/withdraw-modal/withdraw-modal.component';
import { ClaimModalComponent } from '../components/claim-modal/claim-modal.component';
import { ModalService } from '@app/core/modals/services/modal.service';

const STAKING_MODAL_OPTIONS = {
  closeable: false,
  size: 's' as TuiDialogSize
};

@Injectable()
export class StakingModalService {
  constructor(private readonly dialogService: ModalService) {}

  public showDepositModal(
    amount: BigNumber,
    duration: number,
    unlockDate: number
  ): Observable<boolean> {
    return this.dialogService.showDialog<NewPositionModalComponent, boolean>(
      NewPositionModalComponent,
      {
        ...STAKING_MODAL_OPTIONS,
        title: 'New Position',
        data: {
          amount,
          duration,
          unlockDate
        },
        fitContent: true
      }
    );
  }

  public showWithdrawModal(
    amount: BigNumber,
    needSwitchNetwork$: Observable<boolean>,
    totalNftRewards?: BigNumber
  ): Observable<boolean> {
    return this.dialogService.showDialog<WithdrawModalComponent, boolean>(WithdrawModalComponent, {
      ...STAKING_MODAL_OPTIONS,
      title: 'Withdraw',
      data: {
        amount,
        needSwitchNetwork$,
        totalNftRewards
      },
      fitContent: true
    });
  }

  public showClaimModal(
    rewards: BigNumber,
    needSwitchNetwork$: Observable<boolean>
  ): Observable<boolean> {
    return this.dialogService.showDialog<ClaimModalComponent, boolean>(ClaimModalComponent, {
      ...STAKING_MODAL_OPTIONS,
      title: 'Claim',
      data: { rewards, needSwitchNetwork$ },
      fitContent: true
    });
  }
}
