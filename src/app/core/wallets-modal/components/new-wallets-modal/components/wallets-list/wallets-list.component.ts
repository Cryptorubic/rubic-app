import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WALLET_NAME } from '../../../wallets-modal/models/wallet-name';
import { WalletConfigUI } from '../../models/models';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';

@Component({
  selector: 'app-wallets-list',
  templateUrl: './wallets-list.component.html',
  styleUrls: ['./wallets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletsListComponent {
  @Input() disabled: boolean = false;

  @Input() wallets: WalletConfigUI[] = [];

  @Input() activeWallets: CommonWalletAdapter[] = [];

  @Output() walletSelected = new EventEmitter<WALLET_NAME>();

  @Output() walletLoggedOut = new EventEmitter<WALLET_NAME>();

  constructor(private readonly notificationServices: NotificationsService) {}

  public isWalletActive(walletName: WALLET_NAME): boolean {
    return this.activeWallets.some(wallet => wallet.walletName === walletName);
  }

  public selectWallet(walletName: WALLET_NAME): void {
    if (this.disabled) return;
    if (this.isWalletActive(walletName)) {
      const activeWallet = this.wallets.find(wallet => wallet.value === walletName);
      const friendlyName = activeWallet.name;
      this.notificationServices.showInfo(`${friendlyName} already connected.`);
      return;
    }
    this.walletSelected.emit(walletName);
  }

  public logoutWallet(walletName: WALLET_NAME, event: Event): void {
    if (this.disabled) return;
    event.stopPropagation();
    this.walletLoggedOut.emit(walletName);
  }
}
