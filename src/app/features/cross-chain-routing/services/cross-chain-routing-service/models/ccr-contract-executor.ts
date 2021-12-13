export interface CcrContractExecutor {
  execute: (...args: unknown[]) => Promise<unknown>;
}
