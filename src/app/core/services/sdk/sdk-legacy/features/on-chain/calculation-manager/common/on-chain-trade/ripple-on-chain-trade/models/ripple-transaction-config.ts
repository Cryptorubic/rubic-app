type RippleTransaction = string | Record<string, unknown>;

export interface RippleTransactionConfig {
  transaction: RippleTransaction;
}

export type RippleRawTransactionConfig =
  | RippleTransactionConfig
  | {
      data: RippleTransaction;
    }
  | RippleTransaction;

export function parseRippleTransactionConfig(
  transactionConfig: RippleRawTransactionConfig
): RippleTransactionConfig {
  if (typeof transactionConfig === 'string') {
    return { transaction: transactionConfig };
  }

  if ('transaction' in transactionConfig) {
    return { transaction: transactionConfig.transaction as RippleTransaction };
  }

  if ('data' in transactionConfig) {
    return { transaction: transactionConfig.data as RippleTransaction };
  }

  return { transaction: transactionConfig };
}
