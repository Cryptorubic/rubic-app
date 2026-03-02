import BigNumber from 'bignumber.js';

export interface CrossChainPaymentInfo {
  id: string;
  intermidiateId?: string;
  depositAddress: string;
  toAmount: BigNumber;
  extraField?: {
    name?: string;
    value?: string;
  };
}

export interface CrossChainTransferData {
  id: string;
  intermidiateId?: string;
  toAmount: string;
  depositAddress: string;
  depositExtraId?: string;
  depositExtraIdName?: string;
}
