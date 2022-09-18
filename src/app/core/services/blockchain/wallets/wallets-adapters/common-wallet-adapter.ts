import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { ErrorsService } from '@core/errors/errors.service';
import { Token } from '@shared/models/tokens/token';
import { AddEthChainParams } from '@shared/models/blockchain/add-eth-chain-params';
import { WALLET_NAME } from '@core/wallets/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { isBlockchainName } from '@shared/utils/blockchain/check-blockchain-name';
import { NgZone } from '@angular/core';

export abstract class CommonWalletAdapter<T = RubicAny> {
  public abstract readonly walletType: CHAIN_TYPE;

  protected selectedAddress: string;

  protected selectedChain: string;

  protected isEnabled: boolean;

  public wallet: T = null;

  /**
   * is the blockchain provider installed
   */
  get isInstalled(): boolean {
    return Boolean(this.wallet);
  }

  /**
   * is the blockchain provider activated
   */
  get isActive(): boolean {
    return this.isEnabled && Boolean(this.selectedAddress);
  }

  /**
   * Is connected app provider supports multi chain wallet.
   */
  abstract get isMultiChainWallet(): boolean;

  /**
   * Current provider name.
   */
  abstract get walletName(): WALLET_NAME;

  /**
   * Gets detailed provider name if it's possible. Otherwise returns common name.
   */
  get detailedWalletName(): string {
    return this.walletName;
  }

  /**
   * current selected wallet address
   * @return current selected wallet address or undefined if isActive is false
   */
  get address(): string {
    if (!this.isActive) {
      return null;
    }
    return this.getAddress();
  }

  /**
   * current selected network
   * @return current selected network or undefined if isActive is false
   */
  get network(): BlockchainData {
    if (!this.isActive) {
      return null;
    }
    return this.getNetwork();
  }

  /**
   * current selected network name
   * @return current selected network name or undefined if isActive is false
   */
  get networkName(): BlockchainName {
    return this.network?.name;
  }

  protected constructor(
    protected readonly errorsService: ErrorsService,
    protected readonly onAddressChanges$: BehaviorSubject<string>,
    protected readonly onNetworkChanges$: BehaviorSubject<BlockchainData>,
    protected readonly zone: NgZone
  ) {
    this.isEnabled = false;
  }

  protected getAddress(): string | null {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  protected getNetwork(): BlockchainData | null {
    if (this.isEnabled && this.selectedChain) {
      if (isBlockchainName(this.selectedChain)) {
        return BlockchainsInfo.getBlockchainByName(this.selectedChain);
      }
      return BlockchainsInfo.getBlockchainById(this.selectedChain);
    }
    return null;
  }

  /**
   * activate the blockchain provider
   */
  public abstract activate(): Promise<void>;

  /**
   * deactivate the blockchain provider
   */
  public abstract deActivate(): void;

  /**
   * opens a window with suggestion to add token to user's wallet
   * @param token token to add
   */
  public abstract addToken(token: Token): Promise<void>;

  public async requestPermissions(): Promise<{ parentCapability: string }[]> {
    return [{ parentCapability: 'eth_accounts' }];
  }

  public abstract switchChain(chainParams: string): Promise<null | never>;

  public abstract addChain(params: AddEthChainParams): Promise<null | never>;
}
