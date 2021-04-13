import { BLOCKCHAIN_NAME } from '../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface BridgeBlockchain {
  key: BLOCKCHAIN_NAME;
  label: string;
  name: string;
  shortedName: string; // for mobiles
  img: string;
  baseUrl: string;
  addressBaseUrl: string;
  scanner: {
    label: string;
    baseUrl: string;
  };
}
