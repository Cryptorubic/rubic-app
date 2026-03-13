export type HinkalWorkerType = 'init' | 'updateBalance' | 'switchNetwork' | 'refreshStoredSnapshot';

export interface WorkerParams {
  type: HinkalWorkerType;
  address?: string;
  chainId?: number;
  signature?: string;
}

export interface WorkerResponse<T> {
  type: HinkalWorkerType;
  result: T;
}
