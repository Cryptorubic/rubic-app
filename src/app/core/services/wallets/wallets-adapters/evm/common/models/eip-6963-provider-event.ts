import { WalletLinkProvider } from 'walletlink';

// Interface for provider information following EIP-6963.
interface EIP6963ProviderInfo {
  walletId: string;
  uuid: string;
  name: string;
  icon: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: WalletLinkProvider;
}

export type EIP6963AnnounceProviderEvent = {
  detail: EIP6963ProviderDetail;
};
