export interface HistoryRequestTx<T> {
  hash: string | null;
  status: T | null;
  explorer_url: string | null;
}
