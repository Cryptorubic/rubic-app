import { BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { ErrorsService } from '@core/errors/errors.service';
import { AddEthChainParams } from '@core/services/blockchain/wallets/models/add-eth-chain-params';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { NgZone } from '@angular/core';

export abstract class CommonWalletAdapter<T = RubicAny> {
  public abstract readonly walletType: CHAIN_TYPE;

  protected selectedAddress: string;

  protected selectedChain: BlockchainName;

  protected isEnabled: boolean;

  public wallet: T = null;

  /**
   * is the blockchain provider activated
   */
  public get isActive(): boolean {
    return this.isEnabled && Boolean(this.selectedAddress);
  }

  /**
   * Is connected app provider supports multi chain wallet.
   */
  public abstract get isMultiChainWallet(): boolean;

  /**
   * Current provider name.
   */
  public abstract get walletName(): WALLET_NAME;

  /**
   * Gets detailed provider name if it's possible. Otherwise returns common name.
   */
  public get detailedWalletName(): string {
    return this.walletName;
  }

  /**
   * current selected wallet address
   * @return current selected wallet address or undefined if isActive is false
   */
  public get address(): string {
    if (!this.isActive) {
      return null;
    }
    return this.selectedAddress;
  }

  /**
   * current selected network
   * @return current selected network or undefined if isActive is false
   */
  public get network(): BlockchainName | null {
    if (!this.isActive) {
      return null;
    }
    return this.selectedChain;
  }

  protected constructor(
    protected readonly onAddressChanges$: BehaviorSubject<string>,
    protected readonly onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    protected readonly errorsService: ErrorsService,
    protected readonly zone: NgZone
  ) {
    this.isEnabled = false;
  }

  /**
   * activate the blockchain provider
   */
  public abstract activate(): Promise<void>;

  /**
   * deactivate the blockchain provider
   */
  public abstract deactivate(): void;

  public abstract switchChain(chainId: string): Promise<null | never>;

  public abstract addChain(params: AddEthChainParams): Promise<null | never>;
}
