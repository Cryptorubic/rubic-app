import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { TokenSecurityStatus, securityMessages } from '@shared/models/tokens/token-security';
import { TUI_IS_MOBILE } from '@taiga-ui/cdk';
import { GO_PLUS_AVAILABLE_NETWORKS } from '../../../../constants/go-plus-available-networks';
import { NATIVE_TOKEN_ADDRESS } from '@app/shared/constants/blockchain/native-token-address';
import { compareAddresses } from '@cryptorubic/sdk';
import {
  ARBITRUM_PLATFORM_TOKEN_ADDRESS,
  ETHEREUM_PLATFORM_TOKEN_ADDRESS
} from '@app/shared/constants/blockchain/platform-token-address';
import { AvailableTokenAmount } from '@app/shared/models/tokens/available-token-amount';
import { blockchainIcon } from '@app/shared/constants/blockchain/blockchain-icon';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { AssetListType } from '@features/trade/models/asset';

@Component({
  selector: 'app-tokens-list-element',
  templateUrl: './tokens-list-element.component.html',
  styleUrls: ['./tokens-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensListElementComponent {
  @Input({ required: true }) token: AvailableTokenAmount;

  @Input({ required: true }) balanceLoading = false;

  @Input({ required: true }) listType: AssetListType;

  @Output() selectToken = new EventEmitter<AvailableTokenAmount>();

  public readonly BLOCKCHAIN_ICON = blockchainIcon;

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  public readonly TokenSecurityStatus = TokenSecurityStatus;

  public readonly securityMessages = securityMessages;

  public get isNativeToken(): boolean {
    return this.token.address === NATIVE_TOKEN_ADDRESS;
  }

  public get isPlatformToken(): boolean {
    return (
      compareAddresses(this.token.address, ETHEREUM_PLATFORM_TOKEN_ADDRESS) ||
      compareAddresses(this.token.address, ARBITRUM_PLATFORM_TOKEN_ADDRESS)
    );
  }

  public get securityStatus(): TokenSecurityStatus {
    if (!GO_PLUS_AVAILABLE_NETWORKS.includes(this.token.blockchain)) {
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

  constructor(@Inject(TUI_IS_MOBILE) public readonly isMobile: boolean) {}

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }
}
