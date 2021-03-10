import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/IBlockchain';

export default interface ConnectionLink {
  blockchainName: BLOCKCHAIN_NAME;
  rpcLink: string;
}
