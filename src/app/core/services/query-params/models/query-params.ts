import { BlockchainName } from 'rubic-sdk';
import { IframeAppearance } from '@core/services/iframe/models/iframe-appearance';
import { SupportedLanguages } from '@shared/models/languages/supported-languages';
import { AssetType } from '@features/swaps/shared/models/form/asset';

export type AdditionalTokens =
  | 'ethTokens'
  | 'bscTokens'
  | 'polygonTokens'
  | 'harmonyTokens'
  | 'avalancheTokens'
  | 'fantomTokens'
  | 'moonriverTokens';

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: AssetType;
  toChain: BlockchainName;
  amount: string;
  amountTo: string;
  onramperTxId: string;

  // iframe
  iframe: IframeAppearance;
  device: 'mobile' | 'desktop';
  hideSelectionFrom: string;
  hideSelectionTo: string;
  slippageIt: string;
  slippageCcr: string;
  background: string;
  accentColor: string; // correct format is ...&accentColor=00FFFF
  theme: string;
  language: SupportedLanguages;
  providerAddress: string;
  feeTarget: string;
  hideUnusedUI: string;
  isDesktop: string;
  enabledProviders: string[];
  enabledBlockchains: BlockchainName[];
  tokenSearch: string;
  rubicLink: string;
  domain: string;
  disabledLifiBridges: string[];
  testMode: string;

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

export type QueryParams = {
  [P in AdditionalTokens]?: string[];
} & Partial<AllQueryParams>;
