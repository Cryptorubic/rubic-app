import { Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { NewPositionModalComponent } from '../components/new-position-modal/new-position-modal.component';
// import { DepositModalComponent } from '../components/deposit-modal/deposit-modal.component';
// import { RequestWithdrawModalComponent } from '../components/request-withdraw-modal/request-withdraw-modal.component';
// import { SuccessModalComponent } from '../components/success-modal/success-modal.component';
// import { WarningModalComponent } from '../components/warning-modal/warning-modal.component';

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

  //   public showWithdrawModal(usdcAmount: BigNumber, brbcAmount: BigNumber): Observable<boolean> {
  //     return this.dialogService.open<boolean>(
  //       new PolymorpheusComponent(RequestWithdrawModalComponent),
  //       {
  //         data: {
  //           usdcAmount,
  //           brbcAmount
  //         }
  //       }
  //     );
  //   }

  //   public showSuccessModal(title: string, text: string): Observable<boolean> {
  //     return this.dialogService.open<boolean>(new PolymorpheusComponent(SuccessModalComponent), {
  //       data: { title, text },
  //       closeable: true
  //     });
  //   }

  //   public showWarningModal(title: string, text: string): Observable<boolean> {
  //     return this.dialogService.open<boolean>(new PolymorpheusComponent(WarningModalComponent), {
  //       data: { title, text },
  //       closeable: true
  //     });
  //   }
}
