import { Web3SupportedBlockchains } from 'src/app/core/services/blockchain/web3/web3-public-service/public-blockchain-adapter.service';

export default interface ConnectionLink {
  blockchainName: Web3SupportedBlockchains;
  rpcLink: string;
  additionalRpcLink: string;
}
