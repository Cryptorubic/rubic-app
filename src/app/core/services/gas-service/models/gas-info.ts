import { GasPrice } from 'rubic-sdk';

export interface GasInfo {
  shouldCalculateGasPrice: boolean;
  gasDetails: GasPrice;
}
