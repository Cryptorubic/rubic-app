import { BackendBlockchain } from '@shared/constants/blockchain/backend-blockchains';

export interface LimitOrderApiInfo {
  hash: string;
  network: BackendBlockchain;
  from_token: string;
  to_token: string;
  from_amount: string;
  to_amount: string;
  user: string;
  provider: 'oneinch';
}
