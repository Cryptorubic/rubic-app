import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainName } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { getWallets } from '@wallet-standard/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { Wallet } from '@mysten/wallet-standard';
import { StandardEventsFeature } from '@wallet-standard/features/src/events';
import { StandardAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-adapter';
import { WalletError } from '@core/errors/models/provider/wallet-error';

export abstract class StandardWalletAdapter<
  SpecificFeatures extends Wallet['features']
> extends CommonWalletAdapter<StandardAdapter<SpecificFeatures>> {
  protected abstract readonly name: string;

  protected abstract readonly chainName: `${string}:${string}`;

  protected abstract readonly blockchainName: BlockchainName;

  protected constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    protected readonly ChainAdapter: new (wallet: Wallet) => StandardAdapter<SpecificFeatures>
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async activate(): Promise<void> {
    const wallets = getWallets();
    const all = wallets.get();
    if (!all.length) {
      throw Error('No wallets found');
    }

    const standardWallet = all.find(
      el => el.name === this.name && el.chains.includes(this.chainName)
    );

    const wallet = new this.ChainAdapter(standardWallet as RubicAny);
    const isConnected = await wallet.connect();
    if (!isConnected) {
      throw new WalletError();
    }
    this.wallet = wallet;
    this.isEnabled = true;

    const address = this.wallet.accounts?.[0];
    if (!address) {
      throw WalletError;
    }
    this.selectedAddress = address;
    this.selectedChain = this.blockchainName;

    this.onNetworkChanges$.next(this.selectedChain);
    this.onAddressChanges$.next(this.selectedAddress);
    this.handleEvents(standardWallet);
  }

  private handleEvents(wallet: Wallet): void {
    const events = wallet.features['standard:events'] as StandardEventsFeature['standard:events'];
    if (events?.on) {
      events.on('change', changes => {
        this.selectedAddress = changes.accounts[0]?.address || null;
        if (this.selectedAddress) {
          this.selectedChain = this.blockchainName;

          this.onNetworkChanges$.next(this.selectedChain);
          this.onAddressChanges$.next(this.selectedAddress);
        }
      });
    } else {
      console.warn('Wallet does not support standard:events');
    }
  }

  public override deactivate(): void {
    this.wallet?.disconnect().then(() => super.deactivate());
  }
}
