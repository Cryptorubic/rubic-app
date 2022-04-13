import { Injectable, Injector } from '@angular/core';
import { TuiDialogService } from '@taiga-ui/core';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs';
import { DepositModalComponent } from '../components/deposit-modal/deposit-modal.component';
import { RequestWithdrawModalComponent } from '../components/request-withdraw-modal/request-withdraw-modal.component';
import { TransferModalComponent } from '../components/transfer-modal/transfer-modal.component';

@Injectable()
export class LiquidityProvidingModalService {
  constructor(
    private readonly dialogService: TuiDialogService,
    private readonly injector: Injector
  ) {}

  showDepositModal(amount: BigNumber): Observable<boolean> {
    return this.dialogService.open<boolean>(new PolymorpheusComponent(DepositModalComponent), {
      data: {
        amount
      }
    });
  }

  showRequestWithdrawModal(amount: BigNumber): Observable<boolean> {
    return this.dialogService.open<boolean>(
      new PolymorpheusComponent(RequestWithdrawModalComponent),
      {
        data: {
          amount
        }
      }
    );
  }

  showTransferModal(): Observable<unknown> {
    return this.dialogService.open(
      new PolymorpheusComponent(TransferModalComponent, this.injector)
    );
  }
}
