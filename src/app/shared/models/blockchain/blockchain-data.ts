import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { BlockchainName } from 'rubic-sdk';

export interface BlockchainData<T = BlockchainName> {
  id: number;
  name: T;
  label: string;
  scannerUrl: string;
  rpcList: unknown[];
  imagePath: string;
  nativeCoin: BlockchainToken;
}
