import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SolanaStandardWalletAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/solana/solana-standard-wallet-adapter';

export class BackpackSolanaWalletAdapter extends SolanaStandardWalletAdapter {
  public readonly walletName = WALLET_NAME.BACKPACK;

  public readonly walletNameUI: string = 'Backpack';

  protected readonly name = 'Backpack';
}
