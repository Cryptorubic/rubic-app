import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawModalComponent {
  public amount: BigNumber;

  public readonly needSwitchNetwork$: Observable<boolean>;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; needSwitchNetwork$: Observable<boolean> }
    >
  ) {
    this.amount = this.context.data.amount;
    this.needSwitchNetwork$ = this.context.data.needSwitchNetwork$;
  }

  public async switchNetwork(): Promise<void> {
    await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }
}
