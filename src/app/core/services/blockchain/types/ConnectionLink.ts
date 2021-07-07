import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export default interface ConnectionLink {
  blockchainName: BLOCKCHAIN_NAME;
  rpcLink: string;
}
