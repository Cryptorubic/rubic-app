import { inject, Injectable } from '@angular/core';
import { HDNodeWallet, JsonRpcProvider, Mnemonic, randomBytes, Wallet } from 'ethers';
import { NETWORK_CONFIG, RailgunWalletInfo } from '@railgun-community/shared-models';
import { createRailgunWallet, loadWalletByID } from '@railgun-community/wallet';
import { PrivacySupportedNetworks } from '@features/privacy/models/supported-networks';
import { EncryptionService } from '@features/privacy/services/encryption/encryption.service';
import { rpcList } from '@shared/constants/blockchain/rpc-list';

@Injectable({
  providedIn: 'root'
})
export class MnemonicService {
  private readonly encryptionService = inject(EncryptionService);

  public lastMnemonic: string = '';

  private createMnemonic(): string {
    const mnemonic = Mnemonic.fromEntropy(randomBytes(16)).phrase.trim();
    return mnemonic;
  }

  private async getEncryptionKey(password: string): Promise<string> {
    try {
      const enryptionKeyFromStore = await this.encryptionService.unlockFromPassword(password);
      return enryptionKeyFromStore;
    } catch (err) {
      const newEncryptionKey = await this.encryptionService.setupFromPassword(password);
      return newEncryptionKey;
    }
  }

  public async createPrivateWallet(
    password: string,
    mnemonic: string,
    chain: PrivacySupportedNetworks
  ): Promise<RailgunWalletInfo> {
    this.lastMnemonic = mnemonic;
    const encryptionKey = await this.getEncryptionKey(password);

    const { deploymentBlock } = NETWORK_CONFIG[chain];
    const creationBlockMap = {
      [chain]: deploymentBlock
    };

    const railgunWalletInfo = await createRailgunWallet(encryptionKey, mnemonic, creationBlockMap);
    const walletInfo = await loadWalletByID(encryptionKey, railgunWalletInfo.id, false);
    return walletInfo;
  }

  public async loadPrivateWallet(password: string, walletId: string): Promise<RailgunWalletInfo> {
    const encryptionKey = await this.getEncryptionKey(password);
    const walletInfo = await loadWalletByID(encryptionKey, walletId, false);
    return walletInfo;
  }

  public getProviderWallet(): { provider: JsonRpcProvider; wallet: HDNodeWallet } {
    const provider = new JsonRpcProvider(rpcList.POLYGON[0]);
    const wallet = Wallet.fromPhrase(this.lastMnemonic, provider);

    return {
      provider,
      wallet
    };
  }
}
