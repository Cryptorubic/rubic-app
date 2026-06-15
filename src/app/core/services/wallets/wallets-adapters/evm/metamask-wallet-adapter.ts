import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { MetamaskError } from '@core/errors/models/provider/metamask-error';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import {
  BlockchainName,
  BlockchainsInfo,
  EVM_BLOCKCHAIN_NAME,
  EvmBlockchainName,
  blockchainId
} from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { DeviceType } from './common/models/device-type';
import { WalletlinkError } from '@app/core/errors/models/provider/walletlink-error';
import { createEVMClient } from '@metamask/connect-evm';
import { rpcList } from '@app/shared/constants/blockchain/rpc-list';
import { EvmWalletAdapter } from './common/evm-wallet-adapter';
import { toHex } from 'viem';
import { isNil } from '@app/shared/utils/utils';

export class MetamaskWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  private readonly device: DeviceType;

  private readonly fallbackDelay = 1_500;

  private readonly metamaskLinks = {
    scheme: (encodedUri: string) => `metamask://wc?uri=${encodedUri}`,
    appStore: 'https://apps.apple.com/app/metamask/id1438144202',
    playStore: 'https://play.google.com/store/apps/details?id=io.metamask',
    androidPackage: 'io.metamask'
  } as const;

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
    if (!(this.wallet as RubicAny)?.isMetaMask) {
      throw new MetamaskError();
    }
  }

  public async activate(): Promise<void> {
    try {
      if (this.device !== 'desktop') {
        try {
          const supportedNetworks = Object.values(EVM_BLOCKCHAIN_NAME)
            .map(chain => {
              const rpc = rpcList[chain][0];
              return rpc ? [toHex(blockchainId[chain]), rpcList[chain][0]] : null;
            })
            .filter(v => !isNil(v));

          const client = await createEVMClient({
            dapp: {
              name: 'Rubic Exchange'
            },
            api: {
              supportedNetworks: Object.fromEntries(supportedNetworks)
            },
            mobile: {}
          });

          this.wallet = client.getProvider();

          const accounts = (await this.wallet.request({
            method: 'eth_requestAccounts'
          })) as string[];
          const address = accounts[0];

          const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;

          this.isEnabled = true;
          this.selectedAddress = address;
          this.selectedChain =
            (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;

          this.onAddressChanges$.next(address);
          this.onNetworkChanges$.next(this.selectedChain);

          this.initSubscriptionsOnChanges();

          return;
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

  public override deactivate(): void {
    this.wallet
      .request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }]
      })
      .catch(() => {});
    super.deactivate();
  }

  /**
   * Subscribes to wallet connect deep link url and redirects after getting.
   */
  private initMobileSubscription(): void {
    //@ts-ignore
    this.wallet.on('display_uri', (uri: string) => {
      const encodedUri = encodeURIComponent(uri);
      this.window.location.href = `metamask://wc?uri=${encodedUri}`;
    });
  }
}
