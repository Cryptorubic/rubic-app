import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { IframeService } from '@core/services/iframe/iframe.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletError } from '@core/errors/models/provider/wallet-error';
import { ErrorsService } from '@core/errors/errors.service';
import { NAVIGATOR } from '@ng-web-apis/common';
import { blockchainId, BlockchainName, BLOCKCHAIN_NAME, wrappedNativeTokensList } from 'rubic-sdk';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  @Input() token: TokenAmount;

  @Output() toggleFavoriteToken: EventEmitter<void> = new EventEmitter<void>();

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly GO_PLUS_AVAILABLE_NETWORKS = [
    BLOCKCHAIN_NAME.ETHEREUM,
    BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    BLOCKCHAIN_NAME.POLYGON,
    BLOCKCHAIN_NAME.ARBITRUM,
    BLOCKCHAIN_NAME.OPTIMISM,
    BLOCKCHAIN_NAME.AVALANCHE,
    BLOCKCHAIN_NAME.FANTOM,
    BLOCKCHAIN_NAME.OKE_X_CHAIN,
    BLOCKCHAIN_NAME.CRONOS,
    BLOCKCHAIN_NAME.GNOSIS,
    BLOCKCHAIN_NAME.TRON
  ] as BlockchainName[];

  public readonly isHorizontalFrame: boolean;

  public hintShown = true;

  public loadingFavoriteToken = false;

  constructor(
    iframeService: IframeService,
    private readonly tokensService: TokensService,
    private readonly cdr: ChangeDetectorRef,
    private readonly errorsService: ErrorsService,
    private readonly authService: AuthService,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {
    this.isHorizontalFrame = iframeService.iframeAppearance === 'horizontal';
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
      ? this.tokensService.removeFavoriteToken(this.token)
      : this.tokensService.addFavoriteToken(this.token);
    this.token.favorite = !this.token.favorite;

    request$.subscribe({
      error: () => {
        this.errorsService.catch(new WalletError());
      },
      complete: () => {
        this.loadingFavoriteToken = false;
        this.cdr.markForCheck();
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
   * Returns true if token's blockchain is available on GoPlus.
   */
  public get isGoPlusAvailable(): boolean {
    return this.GO_PLUS_AVAILABLE_NETWORKS.includes(this.token.blockchain);
  }

  /**
   * Returns true if token is native token.
   */
  public get isNativeToken(): boolean {
    return this.token.address === NATIVE_TOKEN_ADDRESS;
  }

  /**
   * Returns the state of token security.
   */
  public get isSecured(): boolean {
    if (
      (this.token.tokenSecurity === null && !this.isNativeToken) ||
      (this.token.tokenSecurity && !this.token.tokenSecurity.has_info)
    ) {
      return undefined;
    }

    if (
      this.isNativeToken ||
      this.token.tokenSecurity.trust_list ||
      this.token.tokenSecurity.risky_security_items === 0
    ) {
      return true;
    }

    return false;
  }

  /**
   * Returns the link to GoPlus.
   * If token is Native, links to wrapped token.
   */
  public get goPlusLabsLink(): string {
    return `${EXTERNAL_LINKS.GO_PLUS_LABS}/${blockchainId[this.token.blockchain]}/${
      this.isNativeToken
        ? wrappedNativeTokensList[this.token.blockchain].address
        : this.token.address
    }`;
  }
}
