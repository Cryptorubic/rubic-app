import { AbiItem } from 'web3-utils';

export interface ContractData {
  address: string;
  abi: AbiItem[];
}

export interface ContractDataWithMode {
  address: {
    mainnet: string;
    testnet: string;
  };
  abi: AbiItem[];
}
