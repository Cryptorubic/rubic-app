import { BlockchainName } from 'rubic-sdk';

export default interface ConnectionLink {
  blockchainName: BlockchainName;
  rpcLink: string;
  additionalRpcLink: string;
}
