import { BLOCKCHAIN_NAME, EvmBlockchainName } from '@cryptorubic/core';

export const bridgersCrossChainSupportedBlockchains = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.FANTOM,
  BLOCKCHAIN_NAME.TRON
] as const;

export type BridgersCrossChainSupportedBlockchain =
  (typeof bridgersCrossChainSupportedBlockchains)[number];

export type BridgersEvmCrossChainSupportedBlockchain = BridgersCrossChainSupportedBlockchain &
  EvmBlockchainName;
