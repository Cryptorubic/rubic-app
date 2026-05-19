export type PageStatus =
  | 'transfer'
  | 'swap'
  | 'reveal'
  | 'hide'
  | 'wallet'
  | 'login'
  | 'refund'
  | 'walletInfo';

export interface PageType<P = PageStatus> {
  label: string;
  type: P;
}
