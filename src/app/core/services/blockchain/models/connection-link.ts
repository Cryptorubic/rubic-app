import { EthLikeBlockchainName } from '@shared/models/blockchain/blockchain-name';

export default interface ConnectionLink {
  blockchainName: EthLikeBlockchainName;
  rpcLink: string;
  additionalRpcLink: string;
}
