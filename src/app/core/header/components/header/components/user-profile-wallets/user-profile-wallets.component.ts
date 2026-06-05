import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector
} from '@angular/core';
import { USER_WALLETS_CHAIN_TYPES } from './constants/wallets-chain-types';
import { BlockchainName, ChainType } from '@cryptorubic/core';
import { BehaviorSubject, Observable, combineLatestWith, map, startWith, timer } from 'rxjs';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { PROVIDERS_LIST } from '@app/core/wallets-modal/components/wallets-modal/models/providers';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { ModalService } from '@app/core/modals/services/modal.service';

@Component({
  selector: 'app-user-profile-wallets',
  templateUrl: './user-profile-wallets.component.html',
  styleUrls: ['./user-profile-wallets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileWalletsComponent {
  public currentIdx: number = 0;

  public readonly ITEMS_PER_SLIDE = 5;

  public readonly USER_WALLETS_CHAIN_TYPES = USER_WALLETS_CHAIN_TYPES;

  private readonly _selectedChainType$ = new BehaviorSubject<{
    chainType: ChainType;
    selectedManually: boolean;
  }>({ chainType: this.USER_WALLETS_CHAIN_TYPES[0].value, selectedManually: false });

  public readonly selectedChainType$: Observable<ChainType> = this._selectedChainType$.pipe(
    map(selected => {
      if (selected.selectedManually) return selected.chainType;
      const found = this.USER_WALLETS_CHAIN_TYPES.find(item =>
        this.walletConnectorService.getActiveProvider({ chainType: item.value })
      );
      return found ? found.value : this.USER_WALLETS_CHAIN_TYPES[0].value;
    }),
    startWith(this.USER_WALLETS_CHAIN_TYPES[0].value)
  );

  private readonly _balanceLoading$ = new BehaviorSubject<boolean>(false);

  public readonly balanceLoading$ = this._balanceLoading$.asObservable();

  public readonly selectedWallet$ = this.selectedChainType$.pipe(
    combineLatestWith(this.walletConnectorService.activeWallets$),
    map(([chainType]) => this.walletConnectorService.getActiveProvider({ chainType })),
    startWith(null)
  );

  public addressCopied: boolean = false;

  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly cdr: ChangeDetectorRef,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {}

  public selectChainType(chainType: ChainType): void {
    this._selectedChainType$.next({ chainType, selectedManually: true });
  }

  public connectWallet(): void {
    this.modalService.openNewWalletModal(this.injector).subscribe();
  }

  public logoutWallet(walletName: WALLET_NAME): void {
    this.walletConnectorService.deactivate(walletName);
  }

  public copyAddress(walletAddr: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(walletAddr);
  }

  private showHint(): void {
    this.addressCopied = true;
    timer(1500).subscribe(() => {
      this.addressCopied = false;
      this.cdr.markForCheck();
    });
  }

  public getWalletIcon(walletName: WALLET_NAME): string {
    return (
      PROVIDERS_LIST.find(provider => provider.value === walletName)!.img ?? DEFAULT_TOKEN_IMAGE
    );
  }

  public getBlockchainIcon(selectedChain: BlockchainName): string {
    return blockchainIcon[selectedChain];
  }

  public getCopyBtnIcon(): string {
    return this.addressCopied
      ? 'assets/images/icons/success.svg'
      : 'assets/images/swaps/swaps-info/copy-icon.svg';
  }

  public prev(): void {
    if (!this.currentIdx) return;
    this.currentIdx -= 1;
  }

  public next(): void {
    if (this.currentIdx >= this.USER_WALLETS_CHAIN_TYPES.length - this.ITEMS_PER_SLIDE) return;
    this.currentIdx += 1;
  }
}
