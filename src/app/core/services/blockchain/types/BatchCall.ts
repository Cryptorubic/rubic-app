export interface BatchCall {
  contractMethod: string;
  params: unknown[];
  value?: number | string;
}
