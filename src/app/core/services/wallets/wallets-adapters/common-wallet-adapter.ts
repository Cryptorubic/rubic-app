import { BlockchainName, ChainType } from 'rubic-sdk';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';

export abstract class CommonWalletAdapter<T = RubicAny> {
  public abstract readonly chainType: ChainType;

  public abstract readonly walletName: WALLET_NAME;

  protected selectedAddress: string;

  protected selectedChain: BlockchainName | null;

  protected isEnabled: boolean;

  public wallet: T = null;

  protected onAddressChangesSub: Subscription;

  protected onNetworkChangesSub: Subscription;

  public get isActive(): boolean {
    return this.isEnabled && Boolean(this.selectedAddress);
  }

  public get address(): string {
    if (!this.isActive) {
      return null;
    }
    return this.selectedAddress;
  }

  public get network(): BlockchainName | null {
    if (!this.isActive) {
      return null;
    }
    return this.selectedChain;
  }

  /**
   * Gets detailed provider name if it's possible. Otherwise, returns common name.
   */
  public get detailedWalletName(): string {
    return this.walletName;
  }

  protected constructor(
    protected readonly onAddressChanges$: BehaviorSubject<string>,
    protected readonly onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    protected readonly errorsService: ErrorsService,
    protected readonly zone: NgZone,
    protected readonly window: RubicWindow
  ) {
    this.isEnabled = false;
  }

  public abstract activate(): Promise<void>;

  public deactivate(): void {
    this.onAddressChangesSub?.unsubscribe();
    this.onNetworkChangesSub?.unsubscribe();
    this.onAddressChanges$.next(null);
    this.onNetworkChanges$.next(null);
    this.isEnabled = false;
  }
}
