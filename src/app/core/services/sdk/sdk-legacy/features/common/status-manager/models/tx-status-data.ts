import { TxStatus } from '@cryptorubic/web3';

export interface TxStatusData {
  status: TxStatus;
  hash: string | null;
  extraInfo?: {
    mesonSwapId: string;
  };
}
