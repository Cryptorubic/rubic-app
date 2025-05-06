import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainsInfo, CHAIN_TYPE, EvmBlockchainName } from 'rubic-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { fromEvent } from 'rxjs';
import { SupportsManyChains } from '../../../models/abstract-interfaces';
import { EIP6963AnnounceProviderEvent } from './models/eip-6963-provider-event';
import { EvmWalletProviderStore } from './evm-wallet-provider-store';

export abstract class EvmWalletAdapter<T = RubicAny>
  extends CommonWalletAdapter<T>
  implements SupportsManyChains<AddEvmChainParams>
{
  public readonly chainType = CHAIN_TYPE.EVM;

  protected selectedChain: EvmBlockchainName | null;

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    this.onAddressChangesSub = fromEvent(this.wallet as RubicAny, 'accountsChanged').subscribe(
      (accounts: string[]) => {
        this.selectedAddress = accounts[0] || null;
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      }
    );

    this.onNetworkChangesSub = fromEvent(this.wallet as RubicAny, 'chainChanged').subscribe(
      (chainId: string) => {
        this.selectedChain =
          (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
      }
    );

    this.onDisconnectSub = fromEvent(this.wallet as RubicAny, 'disconnect').subscribe(() =>
      this.deactivate()
    );
  }

  public async switchChain(chainId: string): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEvmChainParams): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }

  protected getProvider(walletInfo: {
    provider: string;
    reserveProvider?: string;
  }): Promise<T | null> {
    const providerFromStore =
      EvmWalletProviderStore.getProvider(walletInfo.provider) ||
      EvmWalletProviderStore.getProvider(walletInfo.reserveProvider);

    if (providerFromStore) return providerFromStore;

    return new Promise(resolve => {
      const checkProvider = (event: RubicAny) => {
        const timeoutId = setTimeout(() => {
          this.window.removeEventListener('eip6963:announceProvider', checkProvider);
          resolve(null);
        }, 5000);

        const res = event as EIP6963AnnounceProviderEvent;
        const providerName = res.detail.info.name.toLowerCase();

        EvmWalletProviderStore.setProvider(providerName, res.detail.provider);
        if (providerName === walletInfo.provider || providerName === walletInfo.reserveProvider) {
          clearTimeout(timeoutId);
          this.window.removeEventListener('eip6963:announceProvider', checkProvider);
          resolve(res.detail.provider as T);
        }
      };

      this.window.addEventListener('eip6963:announceProvider', checkProvider);
      this.window.dispatchEvent(new Event('eip6963:requestProvider'));
    });
  }
}
