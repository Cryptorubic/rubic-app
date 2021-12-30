import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

interface BlockchainConfig {
  maxAmount: number;
  blockchainName: RubicBridgeSupportedBlockchains;
  token: {
    symbol: string;
    name: string;
    decimals: number;
  };
}

export interface RubicBridgeConfig {
  from: BlockchainConfig;
  to: BlockchainConfig;
}

export type RubicBridgeSupportedBlockchains =
  | BLOCKCHAIN_NAME.ETHEREUM
  | BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
  | BLOCKCHAIN_NAME.POLYGON;
