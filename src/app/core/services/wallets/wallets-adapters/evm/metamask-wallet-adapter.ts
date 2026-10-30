import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { DeviceType } from './common/models/device-type';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { EvmWalletAdapter } from './common/evm-wallet-adapter';
import { WALLET_CONNECT_SUPPORTED_CHAINS } from '../../constants/evm-chain-ids';

export class MetamaskWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  private readonly device: DeviceType;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    device: DeviceType
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
    this.device = device;
  }

  /**
   * Checks possible metamask errors.
   */
  private checkErrors(): void {
    if (!(this.wallet as RubicAny)?.isMetaMask && this.device === 'desktop') {
      throw new MetamaskError();
    }
  }

  public async activate(): Promise<void> {
    try {
      if (this.device !== 'desktop') {
        await this.activateMobile();
      } else {
        await this.activateDesktop();
      }

      this.isEnabled = true;
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (
        error.code === 4001 ||
        // metamask browser
        error.message?.toLowerCase().includes('user denied message signature')
      ) {
        throw new SignRejectError();
      }

      if (error instanceof RubicError) {
        throw error;
      }

      throw new MetamaskError();
    }
  }

  private async activateDesktop(): Promise<void> {
    const provider = await this.getProvider({
      provider: 'metamask',
      reserveProvider: 'rabby wallet'
    });

    if (!provider) {
      throw new MetamaskError();
    }

    this.wallet = provider;

    const accounts = (await this.wallet.request({
      method: 'eth_requestAccounts'
    })) as RubicAny;
    this.checkErrors();

    const chain = await this.wallet.request({ method: 'eth_chainId' });

    [this.selectedAddress] = accounts;
    this.selectedChain =
      (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
  }

  private async activateMobile(): Promise<void> {
    this.wallet = await EthereumProvider.init({
      projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
      showQrModal: false,
      chains: [1],
      optionalChains: WALLET_CONNECT_SUPPORTED_CHAINS
    });

    this.wallet.on('display_uri', (uri: string) => {
      const deepLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`;
      this.window.location.assign(deepLink);
    });

    const [address] = await this.wallet.enable();
    const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;

    this.selectedAddress = address;
    this.selectedChain =
      (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
  }

  public override deactivate(): void {
    if (this.device !== 'desktop') {
      this.wallet?.disconnect?.().catch(() => {});
    } else {
      this.wallet
        .request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }]
        })
        .catch(() => {});
    }

    super.deactivate();
  }
}
