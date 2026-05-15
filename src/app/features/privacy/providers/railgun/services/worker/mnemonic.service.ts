import { Mnemonic, randomBytes } from 'ethers';
import { NETWORK_CONFIG, RailgunWalletInfo } from '@railgun-community/shared-models';
import {
  createRailgunWallet,
  getWalletMnemonic,
  loadWalletByID,
  walletForID
} from '@railgun-community/wallet';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';
import { AbstractWallet } from '@railgun-community/engine';

export class MnemonicService {
  private lastMnemonic: string = '';

  private createMnemonic(): string {
    const mnemonic = Mnemonic.fromEntropy(randomBytes(16)).phrase.trim();
    return mnemonic;
  }

  public async createPrivateWallet(
    // password: string,
    mnemonic: string,
    chain: PrivacySupportedNetworks,
    encryptionKey: string
  ): Promise<RailgunWalletInfo> {
    this.lastMnemonic = mnemonic;
    // const encryptionKey = await this.getEncryptionKey(password);

    const { deploymentBlock } = NETWORK_CONFIG[chain];
    const creationBlockMap = {
      [chain]: deploymentBlock
    };

    const railgunWalletInfo = await createRailgunWallet(encryptionKey, mnemonic, creationBlockMap);
    // const walletInfo = await loadWalletByID(encryptionKey, railgunWalletInfo.id, false);
    return railgunWalletInfo;
  }

  public async loadWallet(walletId: string, encryptionKey: string): Promise<RailgunWalletInfo> {
    const walletInfo = await loadWalletByID(encryptionKey, walletId, false);
    return walletInfo;
  }

  public async getLastMnemonic(encryptionKey: string, walletId: string): Promise<string> {
    const mnemonic = await getWalletMnemonic(encryptionKey, walletId);
    return mnemonic;
  }

  public async walletForID(railgunId: string): Promise<AbstractWallet> {
    const walletInfo = await walletForID(railgunId);
    return walletInfo;
  }
}
