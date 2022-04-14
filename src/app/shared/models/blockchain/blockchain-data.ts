import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { BlockchainName } from '@shared/models/blockchain/blockchain-name';

export interface BlockchainData<T = BlockchainName> {
  id: number;
  name: T;
  label: string;
  scannerUrl: string;
  rpcLink: string;
  imagePath: string;
  nativeCoin: BlockchainToken;
}
