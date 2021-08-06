import BigNumber from 'bignumber.js';

export type TransactionOptions = {
  onTransactionHash?: (hash: string) => void;
  inWei?: boolean;
  data?: string;
  gas?: BigNumber | string;
  gasPrice?: string;
  value?: BigNumber | string;
};
