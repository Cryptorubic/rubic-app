import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainsInfo, CHAIN_TYPE } from 'rubic-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { AddEthChainParams } from '@core/services/wallets/models/add-eth-chain-params';

export abstract class EvmWalletAdapter<T = RubicAny> extends CommonWalletAdapter<T> {
  public readonly chainType = CHAIN_TYPE.EVM;

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    (this.wallet as RubicAny).on('chainChanged', (chainId: string) => {
      this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId) ?? null;
      if (this.isEnabled) {
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
        console.info('Chain changed', chainId);
      }
    });

    (this.wallet as RubicAny).on('accountsChanged', (accounts: string[]) => {
      this.selectedAddress = accounts[0] || null;
      if (this.isEnabled) {
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
        console.info('Selected account changed to', accounts[0]);
      }
      if (!this.selectedAddress) {
        this.selectedChain = null;
        this.deactivate();
      }
    });
  }

  public async switchChain(chainId: string): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEthChainParams): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
