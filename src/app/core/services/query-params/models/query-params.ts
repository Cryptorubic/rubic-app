import { BlockchainName } from '@shared/models/blockchain/blockchain-name';
import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';
import { SupportedLanguages } from '@shared/models/languages/supported-languages';

export type AdditionalTokens =
  | 'eth_tokens'
  | 'bsc_tokens'
  | 'polygon_tokens'
  | 'harmony_tokens'
  | 'avalanche_tokens'
  | 'fantom_tokens'
  | 'moonriver_tokens';

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: BlockchainName;
  toChain: BlockchainName;
  amount: string;

  // iframe
  iframe: IframeAppearance;
  device: 'mobile' | 'desktop';
  hideSelectionFrom: string;
  hideSelectionTo: string;
  slippageIt: string;
  slippageCcr: string;
  background: string;
  theme: string;
  language: SupportedLanguages;
  fee: string;
  feeTarget: string;
  promoCode: string;
  // Near specific query params.
  // Transaction.
  nearLogin: string;
  toAmount: string;
  transactionHashes: string;
  walletAddress: string;
  errorCode: string;
  errorMessage: string;
  swap_type: string;
  // Login.
  account_id: string;
  public_key: string;
  all_keys: string;
}

export interface QuerySlippage {
  slippageIt: number | null;
  slippageCcr: number | null;
}

export type QueryParams = {
  [P in AdditionalTokens]: string[];
} & AllQueryParams;
