import BigNumber from 'bignumber.js';
import { BatchCall } from '@core/services/blockchain/models/batch-call';

export type GasCalculationMethod = (
  amountIn: string,
  amountOutMin: string,
  path: string[],
  deadline: number
) => { callData: BatchCall; defaultGasLimit: BigNumber };
