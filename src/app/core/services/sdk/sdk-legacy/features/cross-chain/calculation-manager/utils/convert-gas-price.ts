import { GasPrice, GasPriceBN } from '@cryptorubic/web3';
import BigNumber from 'bignumber.js';

export function convertGasDataToBN(gasData: GasPrice): GasPriceBN {
  return Object.entries(gasData).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: new BigNumber(value)
    }),
    {}
  );
}
