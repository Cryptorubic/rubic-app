import { BlockchainName } from 'rubic-sdk';
import networks from '@shared/constants/blockchain/networks';

export interface Blockchain {
  key: BlockchainName;
  name: string;
  img: string;
}

export const BLOCKCHAINS: Record<BlockchainName, Blockchain> = Object.fromEntries(
  networks.map(network => [
    network.name,
    {
      key: network.name,
      name: network.label,
      img: network.imagePath
    }
  ])
) as Record<BlockchainName, Blockchain>;
