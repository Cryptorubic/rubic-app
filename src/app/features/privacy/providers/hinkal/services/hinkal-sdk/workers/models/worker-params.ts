export type HinkalWorkerType = 'init' | 'fetchBalance' | 'switchNetwork';

export interface WorkerParams {
  address: string;
  chainId: number;
  type: HinkalWorkerType;
  signature?: string;
}

export interface WorkerResponse<T> {
  type: HinkalWorkerType;
  result: T;
}
