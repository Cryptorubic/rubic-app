import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MultichainWalletOption } from '@app/core/wallets-modal/components/wallets-modal/models/types';
import { MULTICHAIN_OPTIONS_MAPPING } from '@app/core/wallets-modal/components/wallets-modal/models/multichain-options-mapping';

@Component({
  selector: 'app-multichain-wallet-modal',
  templateUrl: './multichain-wallet-modal.component.html',
  styleUrls: ['./multichain-wallet-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultichainWalletModalComponent {
  public readonly walletOptions: MultichainWalletOption[];

  public readonly walletName: string;

  public readonly supportedOptionsText: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      WALLET_NAME,
      { walletName: WALLET_NAME; walletsToHide: WALLET_NAME[] }
    >
  ) {
    const walletsToHide = context.data.walletsToHide;
    this.walletOptions = MULTICHAIN_OPTIONS_MAPPING[context.data.walletName]!.filter(
      option => !walletsToHide.some(hiddenWallet => hiddenWallet === option.value)
    );

    const walletName = context.data.walletName;
    this.walletName = walletName.charAt(0).toUpperCase() + walletName.slice(1);
    this.supportedOptionsText = this.walletOptions.reduce(
      (acc, cur, i) =>
        `${acc}${i === 0 ? '' : i < this.walletOptions.length - 1 ? ', ' : ' and '}${cur.label}`,
      ''
    );
  }

  public confirm(walletName: WALLET_NAME): void {
    this.context.completeWith(walletName);
  }
}
