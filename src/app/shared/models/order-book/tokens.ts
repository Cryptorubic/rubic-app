export type TokenPart = 'base' | 'quote';

export interface TokenValueType {
  value: string;
  tokenType: TokenPart;
}
