import { AbiItem } from '@cryptorubic/web3';

export interface RoundContract {
  address: string;
  abi: AbiItem[];
  active?: boolean;
}
