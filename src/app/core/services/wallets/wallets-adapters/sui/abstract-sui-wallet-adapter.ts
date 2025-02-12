import { getWallets, Wallet } from '@mysten/wallet-standard';
import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WalletNotInstalledError } from '@core/errors/models/provider/wallet-not-installed-error';
import { FeatureName } from '@suiet/wallet-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export abstract class AbstractSuiWalletAdapter extends CommonWalletAdapter<Wallet> {
  public readonly chainType = CHAIN_TYPE.SUI;

  public abstract readonly extensionName: string;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    const wallets = getWallets().get();
    const adapter = wallets.find(
      walletAdapter =>
        walletAdapter.name === this.extensionName &&
        this.isStandardWalletAdapterCompatibleWallet(walletAdapter)
    );
    if (!adapter) {
      throw new WalletNotInstalledError();
    }
    this.wallet = adapter;
    try {
      await (this.wallet.features['standard:connect'] as RubicAny).connect();
      // await waitFor(50);
      const account = this.wallet.accounts[0];

      this.selectedChain = BLOCKCHAIN_NAME.SUI;
      this.selectedAddress = account.address;
      this.isEnabled = true;

      this.onNetworkChanges$.next(this.selectedChain);
    } catch (err) {
      console.error('[SuiDefaultAdapter] Activation error - ', err);
      throw err;
    }
  }

  private isStandardWalletAdapterCompatibleWallet(wallet: Wallet): boolean {
    const res =
      FeatureName.STANDARD__CONNECT in wallet.features &&
      FeatureName.STANDARD__EVENTS in wallet.features &&
      (FeatureName.SUI__SIGN_TRANSACTION in wallet.features ||
        FeatureName.SUI__SIGN_AND_EXECUTE_TRANSACTION_BLOCK in wallet.features);
    return res;
  }
}
