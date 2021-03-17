import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface Blockchain {
  name: BLOCKCHAIN_NAME;
  code: number;
  label: string;
  image: string;
}
