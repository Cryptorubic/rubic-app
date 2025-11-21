import { GasPrice } from '@cryptorubic/web3';

export interface GasInfo {
  shouldCalculateGasPrice: boolean;
  gasPriceOptions: GasPrice;
}
