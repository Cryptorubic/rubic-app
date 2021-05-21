export type TokenPart = 'from' | 'to';

export interface TokenValueType {
  value: string;
  tokenType: TokenPart;
}
