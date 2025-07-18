import { BLOCKCHAIN_NAME, EvmBlockchainName, TronBlockchainName } from '@cryptorubic/core';

const nonOnChainNetworks = [
  BLOCKCHAIN_NAME.BITGERT,
  BLOCKCHAIN_NAME.DFK,
  BLOCKCHAIN_NAME.BOBA_BSC,
  BLOCKCHAIN_NAME.EOS,
  BLOCKCHAIN_NAME.ETHEREUM_CLASSIC,
  BLOCKCHAIN_NAME.FILECOIN,
  BLOCKCHAIN_NAME.FLARE,
  BLOCKCHAIN_NAME.IOTEX,
  BLOCKCHAIN_NAME.ONTOLOGY,
  BLOCKCHAIN_NAME.THETA,
  BLOCKCHAIN_NAME.XDC,
  BLOCKCHAIN_NAME.BITCOIN_CASH
] as const;
type NonOnChainNetworks = (typeof nonOnChainNetworks)[number];

export type SupportedOnChainNetworks = Exclude<
  EvmBlockchainName | TronBlockchainName,
  NonOnChainNetworks
>;
