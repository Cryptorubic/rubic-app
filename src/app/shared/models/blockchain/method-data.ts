import BigNumber from 'bignumber.js';

export interface MethodData {
  methodName: string;
  methodArguments: unknown[];
  value?: BigNumber | string;
}
