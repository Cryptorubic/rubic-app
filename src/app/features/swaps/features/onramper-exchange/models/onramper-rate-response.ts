export type OnramperRate = {
  networkFee: number;
  paymentMethod: string;
  payout: number;
  ramp: string;
  rate: number;
  transactionFee: number;
};

export type OnramperError = {
  errors: {
    errorId: number;
    message: string;
    type: string;
    minAmount?: number;
    maxAmount?: number;
  }[];
  paymentMethod: string;
  ramp: string;
};

export type OnramperRateResponse = ReadonlyArray<OnramperRate | OnramperError>;
