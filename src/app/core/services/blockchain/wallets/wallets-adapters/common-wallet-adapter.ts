import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { Token } from 'src/app/shared/models/tokens/Token';
import { AddEthChainParams } from 'src/app/shared/models/blockchain/add-eth-chain-params';
import { WALLET_NAME } from 'src/app/core/wallets/components/wallets-modal/models/providers';
import { BehaviorSubject } from 'rxjs';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

export abstract class CommonWalletAdapter<T = RubicAny> {
  protected selectedAddress: string;

  protected selectedChain: string;

  protected isEnabled: boolean;

  protected wallet: T = null;

  /**
   * is the blockchain provider installed
   */
  get isInstalled(): boolean {
    return Boolean(this.wallet);
  }

  abstract get walletType(): 'solana' | 'ethLike';

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
  get network(): IBlockchain {
    if (!this.isActive) {
      return null;
    }
    return this.getNetwork();
  }

  public errorsService: ErrorsService;

  protected getAddress(): string | null {
    if (this.isEnabled) {
      return this.selectedAddress;
    }
    return null;
  }

  protected getNetwork(): IBlockchain | null {
    if (this.isEnabled && this.selectedChain) {
      return (
        BlockchainsInfo.getBlockchainByName(this.selectedChain as BLOCKCHAIN_NAME) ||
        BlockchainsInfo.getBlockchainById(this.selectedChain)
      );
    }
    return null;
  }

  protected readonly onAddressChanges$: BehaviorSubject<string>;

  protected readonly onNetworkChanges$: BehaviorSubject<IBlockchain>;

  protected constructor(
    errorsService: ErrorsService,
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<IBlockchain>
  ) {
    this.errorsService = errorsService;
    this.onAddressChanges$ = onAddressChanges$;
    this.onNetworkChanges$ = onNetworkChanges$;
  }

  public abstract signPersonal(message: string): Promise<string>;

  /**
   * current selected network name
   * @return current selected network name or undefined if isActive is false
   */
  get networkName(): BLOCKCHAIN_NAME {
    return this.network?.name;
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
