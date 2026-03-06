import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { ShieldedBalanceToken } from '../../models/shielded-balance-token';
import { NAVIGATOR } from '@ng-web-apis/common';
import { HeaderStore } from '@app/core/header/services/header.store';
import { blockchainScanner } from '@app/shared/constants/blockchain/blockchain-scanner';

@Component({
  selector: 'app-dropdown-options-shielded-token',
  templateUrl: './dropdown-options-shielded-token.component.html',
  styleUrls: ['./dropdown-options-shielded-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownOptionsShieldedTokenComponent {
  @Input({ required: true }) token: ShieldedBalanceToken;

  public isDropdownOpen: boolean = false;

  public isCopyClicked: boolean = false;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private cdr: ChangeDetectorRef,
    private readonly headerStore: HeaderStore
  ) {}

  public get showDropdown(): boolean {
    return Boolean(this.token.shieldTxHash || this.token.ppoiLink);
  }

  public getTxLink(token: ShieldedBalanceToken): string {
    const scannerLink =
      blockchainScanner[token.blockchain].baseUrl + blockchainScanner[token.blockchain].TRANSACTION;

    return `${scannerLink}${token.shieldTxHash}`;
  }

  public copyToClipboard(): void {
    this.isCopyClicked = true;
    this.navigator.clipboard.writeText(this.token.shieldTxHash);

    setTimeout(() => {
      this.isCopyClicked = false;
      this.cdr.markForCheck();
    }, 500);
  }
}
