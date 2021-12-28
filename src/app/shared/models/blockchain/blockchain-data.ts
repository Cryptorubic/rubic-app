import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainData {
  id: number;
  name: BLOCKCHAIN_NAME;
  label: string;
  scannerUrl: string;
  rpcLink: string;
  imagePath: string;
  nativeCoin: BlockchainToken;
}
