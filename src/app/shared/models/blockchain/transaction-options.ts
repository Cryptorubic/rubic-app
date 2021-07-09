import BigNumber from 'bignumber.js';

export type TransactionOptions = {
  onTransactionHash?: (hash: string) => void;
  inWei?: boolean;
  data?: string;
  gas?: string;
  gasPrice?: string;
  value?: BigNumber | string;
};
