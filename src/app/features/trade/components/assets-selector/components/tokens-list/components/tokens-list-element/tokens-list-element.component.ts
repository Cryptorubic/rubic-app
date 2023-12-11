import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TokenSecurityStatus } from '@shared/models/tokens/token-security';
import {
  ARBITRUM_PLATFORM_TOKEN_ADDRESS,
  ETHEREUM_PLATFORM_TOKEN_ADDRESS
} from '@shared/constants/blockchain/platform-token-address';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletError } from '@core/errors/models/provider/wallet-error';
import { ErrorsService } from '@core/errors/errors.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import {
  blockchainId,
  BLOCKCHAIN_NAME,
  wrappedNativeTokensList,
  EvmBlockchainName,
  compareAddresses
} from 'rubic-sdk';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { GO_PLUS_AVAILABLE_NETWORKS } from '@features/trade/components/assets-selector/constants/go-plus-available-networks';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent implements OnInit {
  public dropdownOpen = false;

  @Input() token: TokenAmount;

  @Input() balanceLoading = false;

  @Output() toggleFavoriteToken: EventEmitter<void> = new EventEmitter<void>();

  @Output() selectToken = new EventEmitter<void>();

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly TokenSecurityStatus = TokenSecurityStatus;

  public readonly securityMessages = {
    [TokenSecurityStatus.TRUST_LIST]: 'Token is in the Go+ Trust List',
    [TokenSecurityStatus.SCAM_LIST]: 'Token is in the Scam List',
    [TokenSecurityStatus.SECURED]: 'Token code has no elements of concern',
    [TokenSecurityStatus.LOW_RISK]: 'Token code contains some low risk elements of concern',
    [TokenSecurityStatus.HIGH_RISK]: 'Token code contains some high risk elements of concern',
    [TokenSecurityStatus.NO_INFO]: 'No information',
    [TokenSecurityStatus.PLATFORM_TOKEN]: 'Platform Token'
  };

  public hintShown = true;

  public loadingFavoriteToken = false;

  public allowCopy: boolean;

  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator,
    @Inject(TUI_IS_MOBILE) public readonly isMobile: boolean
  ) {}

  ngOnInit() {
    this.allowCopy =
      this.token.address !== '0x0000000000000000000000000000000000000000' &&
      this.token.address !== '';
  }

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }

  /**
   * Makes token favorite or not favorite in the list.
   */
  public toggleFavorite(): void {
    if (this.loadingFavoriteToken) {
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

  /**
   * Copy error message to clipboard.
   */
  public copyToClipboard(event: MouseEvent): void {
    event.stopPropagation();
    this.showHint();
    this.navigator.clipboard.writeText(this.token.address);
  }

  /**
   * Show copy to clipboard hint.
   */
  private showHint(): void {
    this.hintShown = false;
    setTimeout(() => {
      this.hintShown = true;
      this.cdr.markForCheck();
    }, 1500);
  }

  /**
   * Returns true if token is native token.
   */
  public get isNativeToken(): boolean {
    return this.token.address === NATIVE_TOKEN_ADDRESS;
  }

  /**
   * Returns true if token is platform token.
   */
  public get isPlatformToken(): boolean {
    return (
      compareAddresses(this.token.address, ETHEREUM_PLATFORM_TOKEN_ADDRESS) ||
      compareAddresses(this.token.address, ARBITRUM_PLATFORM_TOKEN_ADDRESS)
    );
  }

  /**
   * Returns the state of token security.
   */
  public get securityStatus(): TokenSecurityStatus {
    if (GO_PLUS_AVAILABLE_NETWORKS.includes(this.token.blockchain) === false) {
      return TokenSecurityStatus.UNSUPPORTED_BLOCKCHAIN;
    }

    if (this.isPlatformToken) {
      return TokenSecurityStatus.PLATFORM_TOKEN;
    }

    if (this.isNativeToken || (this.token.tokenSecurity && this.token.tokenSecurity.trust_list)) {
      return TokenSecurityStatus.TRUST_LIST;
    }

    if (
      !this.token.tokenSecurity ||
      (this.token.tokenSecurity && this.token.tokenSecurity.has_info === false)
    ) {
      return TokenSecurityStatus.NO_INFO;
    }

    if (this.token.tokenSecurity.fake_token || this.token.tokenSecurity.is_airdrop_scam) {
      return TokenSecurityStatus.SCAM_LIST;
    }

    if (
      this.token.tokenSecurity.risky_security_items === 0 &&
      this.token.tokenSecurity.attention_security_items === 0
    ) {
      return TokenSecurityStatus.SECURED;
    }

    if (this.token.tokenSecurity.risky_security_items > 0) {
      return TokenSecurityStatus.HIGH_RISK;
    }

    return TokenSecurityStatus.LOW_RISK;
  }

  /**
   * Returns the link to GoPlus.
   * If token is Native, links to wrapped token.
   */
  public get goPlusLabsLink(): string {
    const goPlusChainID =
      this.token.blockchain === BLOCKCHAIN_NAME.TRON ? 'tron' : blockchainId[this.token.blockchain];
    const goPlusTokenAddress = this.isNativeToken
      ? wrappedNativeTokensList[this.token.blockchain as EvmBlockchainName]?.address
      : this.token.address;

    return `${EXTERNAL_LINKS.GO_PLUS_LABS}/${goPlusChainID}/${goPlusTokenAddress || ''}`;
  }

  protected readonly open = open;
}
