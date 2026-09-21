import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, ChainType } from '@cryptorubic/core';

const CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT: ChainType[] = [
  CHAIN_TYPE.EVM,
  CHAIN_TYPE.SOLANA,
  CHAIN_TYPE.TON,
  CHAIN_TYPE.BITCOIN
] as const;

export function chainSupportsQrWithAmount(chain: BlockchainName): boolean {
  const chainType = BlockchainsInfo.getChainType(chain);
  return CHAINTYPE_WITH_AMOUNT_IN_QR_SUPPORT.includes(chainType);
}
