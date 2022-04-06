import { Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { DepositModalComponent } from '../components/deposit-modal/deposit-modal.component';
import { RequestWithdrawModalComponent } from '../components/request-withdraw-modal/request-withdraw-modal.component';
import { WithdrawModalComponent } from '../components/withdraw-modal/withdraw-modal.component';

interface DepositModalData {
  brbcAmount: BigNumber;
  usdcAmount: BigNumber;
  period: string;
}

interface WithdrawModalData {}

@Injectable()
export class LiquidityProvidingModalService {
  constructor(private readonly dialogService: TuiDialogService) {}

  showDepositModal(data: DepositModalData): Observable<DepositModalData> {
    return this.dialogService.open<DepositModalData>(
      new PolymorpheusComponent(DepositModalComponent),
      {
        data
      }
    );
  }

  showWithdrawModal(data: WithdrawModalData): Observable<WithdrawModalData> {
    return this.dialogService.open<WithdrawModalData>(
      new PolymorpheusComponent(WithdrawModalComponent),
      { data }
    );
  }

  showRequestWithdrawModal(): Observable<unknown> {
    return this.dialogService.open(new PolymorpheusComponent(RequestWithdrawModalComponent));
  }
}
