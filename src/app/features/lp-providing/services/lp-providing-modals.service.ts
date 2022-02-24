import { Injectable } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { StakeModalComponent } from '../components/stake-modal/stake-modal.component';
import { WithdrawModalComponent } from '../components/withdraw-modal/withdraw-modal.component';

interface StakeModalData {
  brbcAmount: BigNumber;
  usdcAmount: BigNumber;
  period: string;
}

interface WithdrawModalData {}

@Injectable()
export class LpProvidingModalsService {
  constructor(private readonly dialogService: TuiDialogService) {}

  showStakeModal(data: StakeModalData): Observable<StakeModalData> {
    return this.dialogService.open<StakeModalData>(new PolymorpheusComponent(StakeModalComponent), {
      data
    });
  }

  showWithdrawModal(data: WithdrawModalData): Observable<WithdrawModalData> {
    return this.dialogService.open<WithdrawModalData>(
      new PolymorpheusComponent(WithdrawModalComponent),
      { data }
    );
  }
}
