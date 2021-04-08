import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BridgeBlockchain {
  name: BLOCKCHAIN_NAME;
  shortLabel: string; // for mobiles
  label: string;
  img: string;
  baseUrl: string;
  addressBaseUrl: string;
  scanner: {
    label: string;
    baseUrl: string;
  };
}
