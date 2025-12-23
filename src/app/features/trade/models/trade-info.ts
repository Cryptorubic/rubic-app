import { AssetSelector } from '@app/shared/models/asset-selector';
import BigNumber from 'bignumber.js';

export interface TokenFiatAmount {
  tokenAmount: BigNumber;
  fiatAmount: string;
}

export interface TradeInfo {
  fromAsset: AssetSelector;
  fromValue: TokenFiatAmount;
  toAsset: AssetSelector;
  toValue: TokenFiatAmount;
}
