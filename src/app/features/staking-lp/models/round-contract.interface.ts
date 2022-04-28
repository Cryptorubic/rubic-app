import { AbiItem } from 'web3-utils';

export interface RoundContract {
  address: string;
  abi: AbiItem[];
  active?: boolean;
}
