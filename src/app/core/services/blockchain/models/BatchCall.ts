export interface BatchCall {
  contractMethod: string;
  params: unknown[];
  value?: string;
}
