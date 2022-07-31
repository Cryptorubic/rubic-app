import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/blockchain/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-claim-modal',
  templateUrl: './claim-modal.component.html',
  styleUrls: ['./claim-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimModalComponent {
  public rewards: BigNumber;

  public readonly needSwitchNetwork$: Observable<boolean>;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { rewards: BigNumber; needSwitchNetwork$: Observable<boolean> }
    >
  ) {
    this.rewards = this.context.data.rewards;
    this.needSwitchNetwork$ = this.context.data.needSwitchNetwork$;
  }

  public async switchNetwork(): Promise<void> {
    this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
    this.cdr.detectChanges();
  }
}
