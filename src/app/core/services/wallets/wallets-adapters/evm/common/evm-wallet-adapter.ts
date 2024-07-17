import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainsInfo, CHAIN_TYPE, EvmBlockchainName } from 'rubic-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { fromEvent } from 'rxjs';

export abstract class EvmWalletAdapter<T = RubicAny> extends CommonWalletAdapter<T> {
  public readonly chainType = CHAIN_TYPE.EVM;

  protected selectedChain: EvmBlockchainName | null;

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    this.onAddressChangesSub = fromEvent(this.wallet as RubicAny, 'accountsChanged').subscribe(
      (accounts: string[]) => {
        console.log(accounts);
        this.selectedAddress = accounts[0] || null;
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      }
    );

    this.onNetworkChangesSub = fromEvent(this.wallet as RubicAny, 'chainChanged').subscribe(
      (chainId: string) => {
        console.log(chainId);
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
}
