import { BehaviorSubject } from 'rxjs';
import WalletConnect from '@walletconnect/web3-provider';
import { ErrorsService } from '@core/errors/errors.service';
import { IWalletConnectProviderOptions } from '@walletconnect/types';
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
import WalletConnectProvider from '@walletconnect/web3-provider';

export abstract class WalletConnectAbstractAdapter extends EvmWalletAdapter<WalletConnectProvider> {
  protected constructor(
    providerConfig: IWalletConnectProviderOptions,
    accountChange$: BehaviorSubject<string>,
    chainChange$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(accountChange$, chainChange$, errorsService, zone, window);

    this.wallet = new WalletConnect({
      rpc: this.getNetworksProviders(),
      ...providerConfig
    });
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
      const [address] = await this.wallet.enable();
      this.isEnabled = true;

      this.selectedAddress = address;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(this.wallet.chainId) as EvmBlockchainName) ?? null;
      this.onAddressChanges$.next(address);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      throw new WalletlinkError();
    }
  }

  public async deactivate(): Promise<void> {
    await this.wallet.close();
    super.deactivate();
  }
}
