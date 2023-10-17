import { BlockchainName } from 'rubic-sdk';
import { SupportedLanguages } from '@shared/models/languages/supported-languages';
import { AssetType } from '@features/trade/models/asset';

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
  fromChain: AssetType;
  toChain: BlockchainName;
  amount: string;
  amountTo: string;
  onramperTxId: string;

  device: 'mobile' | 'desktop';
  domain: string;
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
  disabledLifiBridges: string[];
  testMode: string;
  crossChainIntegratorAddress: string;
  onChainIntegratorAddress: string;
}

export type QueryParams = {
  [P in AdditionalTokens]?: string[];
} & Partial<AllQueryParams>;
