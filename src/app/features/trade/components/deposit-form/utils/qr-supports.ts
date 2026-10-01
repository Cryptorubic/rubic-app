import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, ChainType } from '@cryptorubic/core';

const CHAINTYPE_WITH_CUSTOM_QR_SPEC = [
  CHAIN_TYPE.EVM,
  CHAIN_TYPE.SOLANA,
  CHAIN_TYPE.TON,
  CHAIN_TYPE.BITCOIN
] as const;

export type ChainWithCustomQrSpecGenerator = (typeof CHAINTYPE_WITH_CUSTOM_QR_SPEC)[number];

export function isChainWithCustomQrGenerator(chain: BlockchainName): boolean {
  const chainType = BlockchainsInfo.getChainType(chain);
  return CHAINTYPE_WITH_CUSTOM_QR_SPEC.some(ct => ct === chainType);
}

export function isChainTypeWithCustomQrGenerator(
  chainType: ChainType
): chainType is ChainWithCustomQrSpecGenerator {
  return CHAINTYPE_WITH_CUSTOM_QR_SPEC.some(ct => ct === chainType);
}
