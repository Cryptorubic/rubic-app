import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { MinimalToken } from '@shared/models/tokens/minimal-token';

export function isMinimalToken(asset: unknown): asset is MinimalToken {
  return asset && typeof asset === 'object' && 'blockchain' in asset && 'address' in asset;
}

export function isBlockchainToken(asset: unknown): asset is BlockchainToken {
  return (
    asset &&
    typeof asset === 'object' &&
    'blockchain' in asset &&
    'address' in asset &&
    'name' in asset &&
    'symbol' in asset &&
    'decimals' in asset
  );
}
