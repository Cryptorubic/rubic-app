import { Mnemonic, randomBytes } from 'ethers';
import { NETWORK_CONFIG, RailgunWalletInfo } from '@railgun-community/shared-models';
import { createRailgunWallet, loadWalletByID } from '@railgun-community/wallet';
import { PrivacySupportedNetworks } from '@features/privacy/providers/railgun/models/supported-networks';

export class MnemonicService {
  public lastMnemonic: string = '';

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

  public getLastMnemonic(): string {
    return this.lastMnemonic;
  }
}
