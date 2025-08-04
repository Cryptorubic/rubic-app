import { BlockchainName } from '@cryptorubic/sdk';
import { SupportedLanguages } from '@shared/models/languages/supported-languages';
import { AssetType } from '@features/trade/models/asset';

interface AllQueryParams {
  from: string;
  to: string;
  fromChain: AssetType;
  toChain: BlockchainName;
  amount: string;
  amountTo: string;
  onramperTxId: string;

  iframe: string;
  device: 'mobile' | 'desktop';
  domain: string;
  hideSelectionFrom: string;
  hideSelectionTo: string;
  hideTokenSwitcher: string;
  useLargeIframe: string;
  slippageIt: string;
  slippageCcr: string;
  accentColor: string; // correct format is ...&accentColor=00FFFF
  theme: string;
  language: SupportedLanguages;
  providerAddress: string;
  feeTarget: string;
  hideUnusedUI: string;
  isDesktop: string;
  whitelistOnChain: string[];
  whitelistCrossChain: string[];
  blacklistOnChain: string[];
  blacklistCrossChain: string[];
  enabledBlockchains: BlockchainName[];
  tokenSearch: string;
  rubicLink: string;
  disabledLifiBridges: string[];
  disabledRangoBridges: string[];
  testMode: string;
  crossChainIntegratorAddress: string;
  onChainIntegratorAddress: string;
  referral: string;
  swapId: string;
  useSafe: string;
  hideBranding: string;
}

export type QueryParams = {
  [P in BlockchainName]?: string[];
} & Partial<AllQueryParams>;
