import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';

import { CommonWalletAdapter } from '@core/services/blockchain/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainType } from '@shared/models/blockchain/blockchain-type';
import { connect, WalletConnection } from 'near-api-js';
import { NEAR_MAINNET_CONFIG } from '@core/services/blockchain/blockchain-adapters/near/near-config';
import { BlockchainsInfo } from '@core/services/blockchain/blockchain-info';
import { RubicWindow } from '@shared/utils/rubic-window';
import { BlockchainData } from '@shared/models/blockchain/blockchain-data';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { WALLET_NAME } from '@app/core/wallets/components/wallets-modal/models/wallet-name';

export class NearWalletAdapter extends CommonWalletAdapter<WalletConnection> {
  private _publicKey: string;

  public set publicKey(publicKey: string) {
    this._publicKey = publicKey;
  }

  public get walletType(): BlockchainType {
    return 'near';
  }

  public get network(): BlockchainData {
    if (!this.isActive) {
      return null;
    }
    return BlockchainsInfo.getBlockchainByName(BLOCKCHAIN_NAME.NEAR);
  }

  public get isMultiChainWallet(): boolean {
    return false;
  }

  public get walletName(): WALLET_NAME {
    return WALLET_NAME.NEAR;
  }

  constructor(
    onNetworkChanges$: BehaviorSubject<BlockchainData>,
    onAddressChanges$: BehaviorSubject<string>,
    errorsService: ErrorsService,
    private readonly window: RubicWindow
  ) {
    super(errorsService, onAddressChanges$, onNetworkChanges$);
  }

  public async signPersonal(): Promise<string> {
    return this._publicKey;
  }

  public async activate(): Promise<void> {
    const near = await connect(NEAR_MAINNET_CONFIG);
    const wallet = new WalletConnection(near, 'rubic');

    if (!wallet.isSignedIn()) {
      const successUrl = new URL(this.window.location.href);
      successUrl.searchParams.set('nearLogin', 'true');
      await wallet.requestSignIn(
        {
          successUrl: successUrl.href
        },
        'rubic',
        successUrl.href
      );
    } else {
      this.isEnabled = true;
      this.wallet = wallet;
      this.selectedAddress = wallet.account().accountId;
      this.selectedChain = NEAR_MAINNET_CONFIG.networkId;

      this.onNetworkChanges$.next(this.getNetwork());
      this.onAddressChanges$.next(this.selectedAddress);
    }
  }

  public async deActivate(): Promise<void> {
    if (this.wallet?.isSignedIn()) {
      this.wallet.signOut();
    }
  }

  public async addChain(): Promise<null> {
    return null;
  }

  public async switchChain(): Promise<null> {
    return null;
  }

  public async addToken(): Promise<void> {
    return;
  }
}
