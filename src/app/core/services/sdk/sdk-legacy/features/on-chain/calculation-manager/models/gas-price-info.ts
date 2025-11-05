import BigNumber from 'bignumber.js';

export interface GasPriceInfo {
    /* wei */
    readonly gasPrice: BigNumber;
    readonly gasPriceInEth: BigNumber;
    readonly gasPriceInUsd: BigNumber;
    /* wei */
    readonly maxFeePerGas?: BigNumber;
}
