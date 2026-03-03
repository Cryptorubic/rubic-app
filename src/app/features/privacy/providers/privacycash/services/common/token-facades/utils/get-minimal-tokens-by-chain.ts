import { AssetListType } from '@app/features/trade/models/asset';
import { MinimalToken } from '@app/shared/models/tokens/minimal-token';
import {
  PRIVACYCASH_SUPPORTED_TOKENS,
  PrivacycashSupportedChain
} from '../../../../constants/privacycash-chains';
import { BlockchainName, BlockchainsInfo } from '@cryptorubic/core';

export function getMinimalTokensByChain(type: AssetListType): MinimalToken[] {
  return BlockchainsInfo.isBlockchainName(type)
    ? PRIVACYCASH_SUPPORTED_TOKENS[type as PrivacycashSupportedChain].map(tokenAddr => ({
        address: tokenAddr,
        blockchain: type
      }))
    : Object.entries(PRIVACYCASH_SUPPORTED_TOKENS)
        .map(([chain, tokenAddresses]: [BlockchainName, string[]]) =>
          tokenAddresses.map(
            tokenAddr => ({ address: tokenAddr, blockchain: chain } as MinimalToken)
          )
        )
        .flat();
}
