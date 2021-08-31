import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export type AdditionalTokens = 'eth_tokens' | 'bsc_tokens' | 'polygon_tokens' | 'harmony_tokens';

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: BLOCKCHAIN_NAME;
  toChain: BLOCKCHAIN_NAME;
  amount: string;
  iframe: 'vertical' | 'horizontal';
  hideSelectionFrom: string;
  hideSelectionTo: string;
  background: string;
  theme: string;
  language: 'en' | 'es' | 'ko' | 'ru' | 'zh';
  device?: 'mobile' | 'desktop';
}
export type QueryParams = {
  [P in AdditionalTokens]: string[];
} &
  AllQueryParams;
