import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import {
  BlockchainName,
  BlockchainsInfo,
  EvmBlockchainName,
  blockchainId
} from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { WalletConnectAbstractAdapter } from './common/wallet-connect-abstract';
import { DeviceType } from './common/models/device-type';
import EthereumProvider from 'node_modules/@walletconnect/ethereum-provider/dist/types/EthereumProvider';
import { WalletlinkError } from '@app/core/errors/models/provider/walletlink-error';

export class MetamaskWalletAdapter extends WalletConnectAbstractAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  private readonly device: DeviceType;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    device: DeviceType,
    chainId?: number
  ) {
    super(
      {
        projectId: 'cc80c3ad93f66e7708a8bdd66e85167e',
        showQrModal: false,
        chains: [chainId | 1],
        optionalChains: Object.values(blockchainId)
      },
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window
    );
    this.device = device;
  }

  /**
   * Checks possible metamask errors.
   */
  private checkErrors(): void {
    if (!(this.wallet as RubicAny)?.isMetaMask) {
      throw new MetamaskError();
    }
  }

  public async activate(): Promise<void> {
    try {
      console.debug('this.device ==>', this.device);
      if (this.device !== 'desktop') {
        try {
          this.wallet = await EthereumProvider.init({
            ...this.providerConfig
          });
          this.initMobileSubscription(this.device === 'ios');

          const [address] = await this.wallet.enable();
          const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;

          this.isEnabled = true;

          this.selectedAddress = address;
          this.selectedChain =
            (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
          this.onAddressChanges$.next(address);
          this.onNetworkChanges$.next(this.selectedChain);

          this.initSubscriptionsOnChanges();
        } catch (error) {
          throw new WalletlinkError();
        }
      }

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
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain as number) as EvmBlockchainName) ?? null;
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

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   */
  private initMobileSubscription(isIos: boolean): void {
    //@ts-ignore
    this.wallet.on('display_uri', (uri: string) => {
      const encodedUri = encodeURIComponent(uri);
      const deepLink = isIos
        ? `https://metamask.app.link/wc?uri=${encodedUri}`
        : `metamask://wc?uri=${encodedUri}`;
      this.window.location.href = deepLink;
    });
  }
}
