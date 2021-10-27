import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { Web3Public } from 'src/app/core/services/blockchain/blockchain-adapters/web3/web3-public';

export const WEB3_ETH_SUPPORTED_BLOCKCHAINS = [
  BLOCKCHAIN_NAME.ETHEREUM,
  BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  BLOCKCHAIN_NAME.POLYGON,
  BLOCKCHAIN_NAME.HARMONY,
  BLOCKCHAIN_NAME.AVALANCHE
] as const;

export type Web3EthSupportedBlockchains = typeof WEB3_ETH_SUPPORTED_BLOCKCHAINS[number];

export type BlockchainPublicAdapter = Web3Public | null;
