import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export type TopTokens = `topTokens[${keyof Record<BLOCKCHAIN_NAME, string>}]`;

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: BLOCKCHAIN_NAME;
  toChain: BLOCKCHAIN_NAME;
  amount: string;
  iframe: string;
  hidden: string;
  hideSelection: string;
  background: string;
  theme: string;
}
export type QueryParams = {
  [P in TopTokens | keyof AllQueryParams]?: string;
};
