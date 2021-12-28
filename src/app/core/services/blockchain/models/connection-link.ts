import { Web3SupportedBlockchains } from '@core/services/blockchain/blockchain-adapters/public-blockchain-adapter.service';

export default interface ConnectionLink {
  blockchainName: Web3SupportedBlockchains;
  rpcLink: string;
  additionalRpcLink: string;
}
