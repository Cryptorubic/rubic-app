import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, ChainType } from '@cryptorubic/core';

const CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT = [
  CHAIN_TYPE.EVM,
  CHAIN_TYPE.SOLANA,
  CHAIN_TYPE.TON,
  CHAIN_TYPE.BITCOIN
] as const;

export type ChainSupportingAmountQR = (typeof CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT)[number];

export function chainSupportsQrWithAmount(chain: BlockchainName): boolean {
  const chainType = BlockchainsInfo.getChainType(chain);
  return CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT.some(ct => ct === chainType);
}

export function chainTypeSupportsQrWithAmount(
  chainType: ChainType
): chainType is ChainSupportingAmountQR {
  return CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT.some(ct => ct === chainType);
}
