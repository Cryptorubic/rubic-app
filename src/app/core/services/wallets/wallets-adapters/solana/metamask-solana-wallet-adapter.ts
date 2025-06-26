import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SolanaStandardWalletAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/solana-standard-wallet-adapter';

export class MetamaskSolanaWalletAdapter extends SolanaStandardWalletAdapter {
  public readonly walletName = WALLET_NAME.METAMASK_SOLANA;

  protected readonly name = 'MetaMask';
}
