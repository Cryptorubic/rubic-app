export interface BtcWallet {
  on: (event: string, callback: (...args: unknown[]) => void) => unknown;
  off: (event: string, callback: (...args: unknown[]) => void) => unknown;
  request<T>(
    args: {
      method: string;
      params: unknown[];
    },
    fn: (error: Error, txHash: string | {}) => unknown
  ): Promise<{ error: null | Error; result: T }>;
  getAccounts(): Promise<string[]>;
}
