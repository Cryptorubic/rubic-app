import { BlockchainToken } from 'src/app/shared/models/tokens/BlockchainToken';
import { BLOCKCHAIN_NAME } from './BLOCKCHAIN_NAME';

export interface IBlockchain {
  id: number;
  name: BLOCKCHAIN_NAME;
  scannerUrl: string;
  rpcLink: string;
  imagePath: string;
  nativeCoin: BlockchainToken;
}
