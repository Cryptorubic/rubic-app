import { Abi } from 'viem';

export interface RoundContract {
  address: string;
  abi: Abi;
  active?: boolean;
}
