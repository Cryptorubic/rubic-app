import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import BigNumber from 'bignumber.js';
import { TokenInfo } from '@shared/components/buy-token/buy-token.component';

interface TokenPair {
  from: TokenInfo;
  to: TokenInfo;
}

@Component({
  selector: 'app-trading-banner',
  templateUrl: './trading-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TradingBannerComponent {
  @Output() handleLinkClick: EventEmitter<TokenPair> = new EventEmitter();

  /**
   * Banner type. Component Renders different texts based on type.
   */
  @Input() type: 'default' | 'custom';

  public readonly bannerTokens: TokenPair;

  constructor() {
    this.type = 'default';
    this.bannerTokens = {
      from: {
        blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        address: NATIVE_TOKEN_ADDRESS,
        symbol: 'ETH',
        amount: new BigNumber(1)
      },
      to: {
        blockchain: BLOCKCHAIN_NAME.MOONRIVER,
        address: NATIVE_TOKEN_ADDRESS,
        symbol: 'MOVR'
      }
    };
  }
}
