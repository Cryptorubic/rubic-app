import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BridgeBlockchain {
  key: BLOCKCHAIN_NAME;
  label: string;
  name: string;
  img: string;
  baseUrl: string;
  addressBaseUrl: string;
  scannerLabel: string;
}
