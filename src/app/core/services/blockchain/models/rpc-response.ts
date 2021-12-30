export interface RpcResponse<T> {
  id: number;
  result: T;
  error: unknown;
}
