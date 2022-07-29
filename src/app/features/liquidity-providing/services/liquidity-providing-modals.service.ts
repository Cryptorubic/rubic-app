import { Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { DepositModalComponent } from '../components/deposit-modal/deposit-modal.component';
import { RequestWithdrawModalComponent } from '../components/request-withdraw-modal/request-withdraw-modal.component';
import { SuccessModalComponent } from '../components/success-modal/success-modal.component';
import { WarningModalComponent } from '../components/warning-modal/warning-modal.component';

@Injectable()
export class LiquidityProvidingModalService {
  constructor(private readonly dialogService: TuiDialogService) {}

  public showDepositModal(brbcAmount: BigNumber, usdcAmount: BigNumber): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(DepositModalComponent), {
      data: {
        brbcAmount,
        usdcAmount
      }
    });
  }

  public showRequestWithdrawModal(
    usdcAmount: BigNumber,
    brbcAmount: BigNumber
  ): Observable<boolean> {
    return this.dialogService.open<boolean>(
      new PolymorpheusComponent(RequestWithdrawModalComponent),
      {
        data: {
          usdcAmount,
          brbcAmount
        }
      }
    );
  }

  public showSuccessModal(title: string, text: string): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(SuccessModalComponent), {
      data: { title, text },
      closeable: true
    });
  }

  public showWarningModal(title: string, text: string): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(WarningModalComponent), {
      data: { title, text },
      closeable: true
    });
  }
}
