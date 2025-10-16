import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from '@cryptorubic/sdk';
import { Observable } from 'rxjs';
import { HeaderStore } from '@core/header/services/header.store';

@Component({
  selector: 'app-claim-modal',
  templateUrl: './claim-modal.component.html',
  styleUrls: ['./claim-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimModalComponent {
  public readonly rewards = this.context.data.rewards;

  public readonly needSwitchNetwork$ = this.context.data.needSwitchNetwork$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore,
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialogContext<
      boolean,
      { rewards: BigNumber; needSwitchNetwork$: Observable<boolean> }
    >
  ) {}

  public async switchNetwork(): Promise<void> {
    await this.walletConnectorService.switchChain(BLOCKCHAIN_NAME.ARBITRUM);
    this.cdr.detectChanges();
  }
}
