import { blockchainColor } from '@app/shared/constants/blockchain/blockchain-color';
import { BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { AssetSelector } from '@app/shared/models/asset-selector';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

export function getTokenAsset(token: BalanceToken): Required<AssetSelector> {
  const blockchain = BLOCKCHAINS[token.blockchain];
  const color = blockchainColor[token.blockchain];

  return {
    secondImage: blockchain.img,
    secondLabel: blockchain.name,
    mainImage: token.image,
    mainLabel: token.symbol,
    secondColor: color
  };
}
