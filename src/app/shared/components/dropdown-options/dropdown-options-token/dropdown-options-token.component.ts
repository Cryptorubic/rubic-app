import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { HeaderStore } from '@app/core/header/services/header.store';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { NATIVE_TOKEN_ADDRESS } from '@app/shared/constants/blockchain/native-token-address';
import {
  ARBITRUM_PLATFORM_TOKEN_ADDRESS,
  ETHEREUM_PLATFORM_TOKEN_ADDRESS
} from '@app/shared/constants/blockchain/platform-token-address';
import { EXTERNAL_LINKS } from '@app/shared/constants/common/links';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { securityMessages, TokenSecurityStatus } from '@app/shared/models/tokens/token-security';
import { NAVIGATOR } from '@ng-web-apis/common';
import {
  BLOCKCHAIN_NAME,
  blockchainId,
  BlockchainsInfo,
  compareAddresses,
  EvmBlockchainName
} from '@cryptorubic/core';
import { wrappedNativeTokensList } from '@cryptorubic/core';

@Component({
  selector: 'app-dropdown-options-token',
  templateUrl: './dropdown-options-token.component.html',
  styleUrls: ['./dropdown-options-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownOptionsTokenComponent {
  @Input({ required: true }) token: AvailableTokenAmount;

  @Input({ required: true }) securityStatus: TokenSecurityStatus;

  public isDropdownOpen: boolean = false;

  public isCopyClicked: boolean = false;

  public loadingFavoriteToken = false;

  public readonly TokenSecurityStatus = TokenSecurityStatus;

  public readonly securityMessages = securityMessages;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  constructor(
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private cdr: ChangeDetectorRef,
    private readonly tokensStoreService: TokensStoreService,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    private readonly headerStore: HeaderStore
  ) {}

  public get canBeAddedToFavorite(): boolean {
    try {
      const tokenChainType = BlockchainsInfo.getChainType(this.token.blockchain);
      const walletChainType = this.authService.userChainType;
      return tokenChainType === walletChainType;
    } catch {
      return false;
    }
  }

  public get showCopyToClipboardOption(): boolean {
    return (
      this.token.address && this.token.address !== '0x0000000000000000000000000000000000000000'
    );
  }

  public get isNativeToken(): boolean {
    return this.token?.address === NATIVE_TOKEN_ADDRESS;
  }

  public get isPlatformToken(): boolean {
    return (
      compareAddresses(this.token.address, ETHEREUM_PLATFORM_TOKEN_ADDRESS) ||
      compareAddresses(this.token.address, ARBITRUM_PLATFORM_TOKEN_ADDRESS)
    );
  }

  public toggleFavorite(): void {
    if (!this.token || this.loadingFavoriteToken) {
      return;
    }

    if (!this.authService.userAddress) {
      this.errorsService.catch(new WalletError());
      return;
    }

    this.loadingFavoriteToken = true;
    const request$ = this.token.favorite
      ? this.tokensStoreService.removeFavoriteToken(this.token)
      : this.tokensStoreService.addFavoriteToken(this.token);

    request$.subscribe({
      error: () => {
        this.errorsService.catch(new WalletError());
      },
      complete: () => {
        this.loadingFavoriteToken = false;
        this.token.favorite = !this.token.favorite;
        this.cdr.detectChanges();
      }
    });
  }

  public get goPlusLabsLink(): string {
    const goPlusChainID =
      this.token.blockchain === BLOCKCHAIN_NAME.TRON ? 'tron' : blockchainId[this.token.blockchain];
    const goPlusTokenAddress = this.isNativeToken
      ? wrappedNativeTokensList[this.token.blockchain as EvmBlockchainName]?.address
      : this.token.address;

    return `${EXTERNAL_LINKS.GO_PLUS_LABS}/${goPlusChainID}/${goPlusTokenAddress || ''}`;
  }

  public copyToClipboard(): void {
    this.isCopyClicked = true;
    this.navigator.clipboard.writeText(this.token.address);

    setTimeout(() => {
      this.isCopyClicked = false;
      this.cdr.markForCheck();
    }, 500);
  }
}
