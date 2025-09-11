import { GasPrice } from '@cryptorubic/sdk';

export interface GasInfo {
  shouldCalculateGasPrice: boolean;
  gasPriceOptions: GasPrice;
}
