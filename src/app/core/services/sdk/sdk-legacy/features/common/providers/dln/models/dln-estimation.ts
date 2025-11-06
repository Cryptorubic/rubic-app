interface DlnBaseToken {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface DlnTokenAmount extends DlnBaseToken {
  amount: string;
}

export interface DlnTokenMinAmount extends DlnTokenAmount {
  minAmount: string;
}

export interface DlnMaxTheoreticalAmountToken extends DlnTokenMinAmount {
  maxTheoreticalAmount: string;
}
