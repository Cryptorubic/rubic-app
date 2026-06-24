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
import { createEVMClient, MetamaskConnectEVM } from '@metamask/connect-evm';
import { rpcList } from '@app/shared/constants/blockchain/rpc-list';
import { EvmWalletAdapter } from './common/evm-wallet-adapter';
import { isNil } from '@app/shared/utils/utils';
import { toHex } from 'viem';

export class MetamaskWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.METAMASK;

  private readonly device: DeviceType;

  private metamaskClient: MetamaskConnectEVM | null = null;

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
    const supportedNetworkEntries = Object.values(EVM_BLOCKCHAIN_NAME)
      .map(chain => {
        const rpc = rpcList[chain][0];
        return rpc ? ([toHex(blockchainId[chain]), rpc] as const) : null;
      })
      .filter(v => !isNil(v));

    const supportedNetworks = Object.fromEntries(supportedNetworkEntries);
    const chainIds = Object.keys(supportedNetworks) as `0x${string}`[];

    const client = await createEVMClient({
      dapp: {
        name: 'Rubic Exchange',
        url: this.window.location.origin
      },
      api: {
        supportedNetworks
      },
      ui: {
        headless: true,
        preferExtension: false
      },
      mobile: {
        useDeeplink: true,
        preferredOpenLink: (deeplink: string) => {
          this.window.location.href = deeplink;
        }
      }
    });

    this.metamaskClient = client;
    this.wallet = client.getProvider();

    const { accounts, chainId } = await client.connect({ chainIds });

    [this.selectedAddress] = accounts;
    this.selectedChain =
      (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
  }

  public override deactivate(): void {
    if (this.metamaskClient) {
      this.metamaskClient.disconnect().catch(() => {});
      this.metamaskClient = null;
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
