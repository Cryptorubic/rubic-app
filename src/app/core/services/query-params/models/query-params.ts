import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

export type AdditionalTokens =
  | 'eth_tokens'
  | 'bsc_tokens'
  | 'polygon_tokens'
  | 'harmony_tokens'
  | 'avalanche_tokens';

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: BLOCKCHAIN_NAME;
  toChain: BLOCKCHAIN_NAME;
  amount: string;
  iframe: 'vertical' | 'horizontal';
  hideSelectionFrom: string;
  hideSelectionTo: string;
  slippageIt: string;
  slippageCcr: string;
  background: string;
  theme: string;
  language: 'en' | 'es' | 'ko' | 'ru' | 'zh';
  device?: 'mobile' | 'desktop';
  // Near specific query params.
  // Transaction.
  nearLogin: string;
  toAmount: string;
  transactionHashes: string | Array<string>;
  walletAddress: string;
  errorCode: string;
  errorMessage: string;
  swap_type: string;
  // Login.
  account_id: string;
  public_key: string;
  all_keys: string;
}

export type QueryParams = {
  [P in AdditionalTokens]: string[];
} & AllQueryParams;
