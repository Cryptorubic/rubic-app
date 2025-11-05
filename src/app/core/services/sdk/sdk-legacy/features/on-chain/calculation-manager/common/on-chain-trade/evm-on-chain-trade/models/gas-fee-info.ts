import BigNumber from 'bignumber.js';

/**
 * Stores gas fee information in calculated trade (in wei).
 */
export interface GasFeeInfo {
    /* wei */
    readonly totalGas?: BigNumber;
    /* wei */
    readonly gasLimit?: BigNumber;
    /* non wei */
    readonly gasPrice?: BigNumber;
    /* non wei */
    readonly gasFeeInEth?: BigNumber;
    /* non wei */
    readonly gasFeeInUsd?: BigNumber;
    /* non wei */
    readonly maxFeePerGas?: BigNumber;
}
