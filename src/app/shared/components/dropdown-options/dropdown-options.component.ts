import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { WalletError } from '@app/core/errors/models/provider/wallet-error';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TokensStoreService } from '@app/core/services/tokens/tokens-store.service';
import { NATIVE_TOKEN_ADDRESS } from '@app/shared/constants/blockchain/native-token-address';
import {
  ARBITRUM_PLATFORM_TOKEN_ADDRESS,
  ETHEREUM_PLATFORM_TOKEN_ADDRESS
} from '@app/shared/constants/blockchain/platform-token-address';
import { EXTERNAL_LINKS } from '@app/shared/constants/common/links';
import { TokenAmount } from '@app/shared/models/tokens/token-amount';
import { TokenSecurityStatus, securityMessages } from '@app/shared/models/tokens/token-security';
import { compareAddresses } from '@app/shared/utils/utils';
import { NAVIGATOR } from '@ng-web-apis/common';
import {
  BLOCKCHAIN_NAME,
  EvmBlockchainName,
  blockchainId,
  wrappedNativeTokensList
} from 'rubic-sdk';

@Component({
  selector: 'app-dropdown-options',
  templateUrl: './dropdown-options.component.html',
  styleUrls: ['./dropdown-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownOptionsComponent {
  @Input() openButtonSize: 'xs' | 's' | 'm' | 'l' | 'xl' = 'm';

  @Input() copyValue: string = '';

  @Input() hasSecurityStatus: boolean = false;

  @Input() hasFavoriteToken: boolean = false;

  /**
   * for SecurityStatus and FavoriteToken options
   */
  @Input() token?: TokenAmount;

  @Input() securityStatus?: TokenSecurityStatus;

  @Output() toggleFavoriteToken: EventEmitter<void> = new EventEmitter<void>();

  public isDropdownOpen: boolean = false;

  public isHintShown: boolean = true;

  public loadingFavoriteToken = false;

  public readonly TokenSecurityStatus = TokenSecurityStatus;

  public readonly securityMessages = securityMessages;

  public get showCopyToClipboardOption(): boolean {
    return !!this.copyValue;
  }

  public get showSecurityStatusOption(): boolean {
    return (
      this.hasSecurityStatus && this.securityStatus !== TokenSecurityStatus.UNSUPPORTED_BLOCKCHAIN
    );
  }

  public get showFavoriteTokenOption(): boolean {
    return this.hasFavoriteToken;
  }

  constructor(
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    private readonly tokensStoreService: TokensStoreService,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public get isNativeToken(): boolean {
    return this.token?.address === NATIVE_TOKEN_ADDRESS;
  }

  public get isPlatformToken(): boolean {
    return (
      compareAddresses(this.token?.address, ETHEREUM_PLATFORM_TOKEN_ADDRESS) ||
      compareAddresses(this.token?.address, ARBITRUM_PLATFORM_TOKEN_ADDRESS)
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
        this.toggleFavoriteToken.emit();
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

  public copyToClipboard(event: MouseEvent): void {
    event.stopPropagation();
    this.showHint();
    this.navigator.clipboard.writeText(this.copyValue);
  }

  private showHint(): void {
    this.isHintShown = false;

    setTimeout(() => {
      this.isHintShown = true;
      this.cdr.markForCheck();
    }, 1500);
  }
}
