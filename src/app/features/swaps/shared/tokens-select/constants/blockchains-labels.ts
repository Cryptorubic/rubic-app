import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export const BLOCKCHAIN_LABEL: Partial<Record<BlockchainName, string>> = {
  ETH: 'Ethereum',
  BSC: 'Binance',
  POLYGON: 'Polygon',
  HARMONY: 'Harmony',
  AVALANCHE: 'Avalanche',
  MOONRIVER: 'Moonriver',
  FANTOM: 'Fantom',
  ARBITRUM: 'Arbitrum',
  AURORA: 'Aurora',
  SOLANA: 'Solana',
  NEAR: 'Near',
  TELOS: 'Telos EVM'
};
