import { Web3SupportedBlockchains } from '@core/services/blockchain/web3/web3-public-service/web3-public.service';

export default interface ConnectionLink {
  blockchainName: Web3SupportedBlockchains;
  rpcLink: string;
  additionalRpcLink: string;
}
