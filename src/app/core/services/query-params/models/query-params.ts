import { BLOCKCHAIN_NAME } from '../../../../shared/models/blockchain/BLOCKCHAIN_NAME';

export interface QueryParams {
  from?: string;
  to?: string;
  chain?: BLOCKCHAIN_NAME;
  amount?: string;
  iframe?: string;
}
