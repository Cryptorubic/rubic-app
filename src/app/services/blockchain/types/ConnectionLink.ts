import { BLOCKCHAIN_NAME } from './Blockchain';

export default interface ConnectionLink {
  blockchainName: BLOCKCHAIN_NAME;
  rpcLink: string;
}
