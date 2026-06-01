import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainName, CHAIN_TYPE, EvmBlockchainName } from '@cryptorubic/core';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { ChainType } from '@cryptorubic/core';
type Web3AuthWalletAdapterCtor = typeof import('./web3-auth-wallet-adapter').Web3AuthWalletAdapter;

/**
 * Loads {@link Web3AuthWalletAdapter} only when the user picks Web3Auth (separate webpack chunk).
 */
export class LazyWeb3AuthWalletAdapter extends CommonWalletAdapter {
  private inner: InstanceType<Web3AuthWalletAdapterCtor> | null = null;

  public chainType: ChainType = CHAIN_TYPE.EVM;

  public readonly walletName = WALLET_NAME.WEB3AUTH;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  private async getInner(): Promise<InstanceType<Web3AuthWalletAdapterCtor>> {
    if (!this.inner) {
      const { Web3AuthWalletAdapter } = await import(
        /* webpackChunkName: "web3auth-adapter" */
        './web3-auth-wallet-adapter'
      );
      this.inner = new Web3AuthWalletAdapter(
        this.onAddressChanges$,
        this.onNetworkChanges$,
        this.errorsService,
        this.zone,
        this.window
      );
    }
    return this.inner;
  }

  private syncStateFromInner(inner: InstanceType<Web3AuthWalletAdapterCtor>): void {
    this.wallet = inner.wallet;
    // @ts-ignore
    this.isEnabled = inner.isEnabled;
    this.selectedAddress = inner.address;
    this.selectedChain = inner.network;
    this.chainType = inner.chainType;
  }

  public async activate(): Promise<void> {
    const inner = await this.getInner();
    await inner.activate();
    this.syncStateFromInner(inner);
  }

  public override deactivate(): void {
    this.inner?.deactivate();
    this.inner = null;
    super.deactivate();
  }

  public async switchChain(
    evmBlockchainName: EvmBlockchainName,
    customRpcUrl?: string
  ): Promise<boolean> {
    const inner = await this.getInner();
    const result = await inner.switchChain(evmBlockchainName, customRpcUrl);
    this.syncStateFromInner(inner);
    return result;
  }
}
