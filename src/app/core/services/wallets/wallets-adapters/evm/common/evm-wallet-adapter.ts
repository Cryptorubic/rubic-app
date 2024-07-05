import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainsInfo, CHAIN_TYPE, EvmBlockchainName } from 'rubic-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { fromEvent } from 'rxjs';
import { SupportsManyChains } from '../../../models/abstract-interfaces';

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
