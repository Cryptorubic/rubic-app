import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { PROVIDERS_LIST } from '@core/wallets-modal/components/wallets-modal/models/providers';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { blockchainIcon } from '@shared/constants/blockchain/blockchain-icon';
import { CHAIN_TYPE } from '@cryptorubic/sdk';

@Component({
  selector: 'app-metamask-modal',
  templateUrl: './metamask-modal.component.html',
  styleUrls: ['./metamask-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetamaskModalComponent {
  // Hardcoded only 2 blockchains
  public readonly metamasks = PROVIDERS_LIST.filter(el => el.name === 'MetaMask').map(el => {
    const chainType = el.value === WALLET_NAME.METAMASK ? CHAIN_TYPE.EVM : CHAIN_TYPE.SOLANA;
    const walletMapping: Record<
      typeof chainType,
      { label: string; icon: string; value: WALLET_NAME }
    > = {
      [CHAIN_TYPE.EVM]: { label: 'EVM', icon: blockchainIcon.ETH, value: WALLET_NAME.METAMASK },
      [CHAIN_TYPE.SOLANA]: {
        label: 'Solana',
        icon: blockchainIcon.SOLANA,
        value: WALLET_NAME.METAMASK_SOLANA
      }
    };
    return walletMapping[chainType];
  });

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<WALLET_NAME, null>
  ) {}

  public confirm(walletName: WALLET_NAME): void {
    this.context.completeWith(walletName);
  }
}
