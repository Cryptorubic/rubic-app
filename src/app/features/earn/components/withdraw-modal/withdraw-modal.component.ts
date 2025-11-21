import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { Observable } from 'rxjs';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-withdraw-modal',
  templateUrl: './withdraw-modal.component.html',
  styleUrls: ['./withdraw-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WithdrawModalComponent {
  public readonly amount = this.context.data.amount;

  public readonly totalNftRewards = this.context.data.totalNftRewards;

  public readonly needSwitchNetwork$ = this.context.data.needSwitchNetwork$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly headerStore: HeaderStore,
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { amount: BigNumber; needSwitchNetwork$: Observable<boolean>; totalNftRewards?: BigNumber }
    >
  ) {}

  public async switchNetwork(): Promise<void> {
    await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.ARBITRUM);
  }
}
