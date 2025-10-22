import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { BlockchainName } from '@cryptorubic/sdk';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';

export type Asset = FiatAsset | AvailableTokenAmount;

export type UtilityAssetType = 'allChains' | 'gainers' | 'losers' | 'trending' | 'favorite';

export type AssetListType = UtilityAssetType | BlockchainName;
