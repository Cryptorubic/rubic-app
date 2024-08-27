import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WalletlinkError } from '@core/errors/models/provider/walletlink-error';
import { NgZone } from '@angular/core';
import {
  blockchainId,
  BlockchainName,
  BlockchainsInfo,
  EVM_BLOCKCHAIN_NAME,
  EvmBlockchainName
} from 'rubic-sdk';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { rpcList } from '@shared/constants/blockchain/rpc-list';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { IEthereumProvider } from '@walletconnect/ethereum-provider/dist/types/types';
import { EthereumProviderOptions } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider';

export abstract class WalletConnectAbstractAdapter extends EvmWalletAdapter<IEthereumProvider> {
  protected providerConfig: EthereumProviderOptions;

  protected constructor(
    providerConfig: EthereumProviderOptions,
    accountChange$: BehaviorSubject<string>,
    chainChange$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(accountChange$, chainChange$, errorsService, zone, window);
    this.providerConfig = {
      ...providerConfig,
      qrModalOptions: {
        ...providerConfig?.qrModalOptions,
        themeMode: 'dark',
        themeVariables: {
          '--wcm-accent-color': 'var(--tui-primary)',
          // @ts-ignore
          '--wcm-color-bg-1': 'var(--app-background)',
          '--wcm-background-color': 'var(--app-background)'
        }
      }
    };
  }

  public updateDefaultChain(chainId: number): void {
    this.providerConfig = {
      ...this.providerConfig,
      chains: [chainId]
    };
  }

  /**
   * Gets RPC links for app networks.
   */
  protected getNetworksProviders(): Record<number, string> {
    return Object.values(EVM_BLOCKCHAIN_NAME).reduce((acc, evmBlockchainName) => {
      return {
        ...acc,
        [blockchainId[evmBlockchainName]]: rpcList[evmBlockchainName][0]
      };
    }, {});
  }

  public async activate(): Promise<void> {
    try {
      this.wallet = await EthereumProvider.init({
        ...this.providerConfig
      });
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

  public async deactivate(): Promise<void> {
    // @ts-ignore
    this.wallet?.disconnect?.();
    super.deactivate();
  }
}
