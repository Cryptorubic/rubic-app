import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { RubicError } from '@core/errors/models/rubic-error';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { StoreService } from '@core/services/store/store.service';
import { NgZone } from '@angular/core';
import { blockchainId, BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { createCoinbaseWalletSDK, ProviderInterface } from '@coinbase/wallet-sdk';
import { CoinBaseError } from '@core/errors/models/provider/coinbase-error';

export class WalletLinkWalletAdapter extends EvmWalletAdapter<ProviderInterface> {
  public readonly walletName = WALLET_NAME.WALLET_LINK;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    private readonly storeService: StoreService,
    chainId: number
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorService, zone, window);

    chainId = chainId ?? this.storeService.getItem('RUBIC_CHAIN_ID');
    this.wallet = this.getWallet(chainId);
  }

  private getWallet(chainId: number): ProviderInterface {
    if (!chainId) {
      console.error('Desktop walletLink works only with predefined chainId');
      throw new UndefinedError();
    }

    this.selectedChain = BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName;
    //@ts-ignore
    if (!this.window.coinbaseWalletExtension?.isCoinbaseWallet) {
      throw new CoinBaseError();
    }

    const coinbaseWallet = createCoinbaseWalletSDK({
      appName: 'Rubic',
      appLogoUrl: 'https://rubic.exchange/assets/images/rubic-logo.svg',
      appChainIds: Object.values(blockchainId)
    });

    return coinbaseWallet.getProvider();
  }

  public async activate(): Promise<void> {
    try {
      //@ts-ignore
      const [address] = await this.wallet.request<[string]>({ method: 'eth_requestAccounts' });
      const chainId = (await this.wallet.request({ method: 'eth_chainId' })) as string;
      this.isEnabled = true;

      const chainName = BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName;

      this.selectedAddress = address;
      this.selectedChain = chainName;
      this.zone.run(() => {
        this.onAddressChanges$.next(address);
        this.onNetworkChanges$.next(this.selectedChain);
      });
      this.storeService.setItem('RUBIC_CHAIN_ID', Number(chainId));

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (error instanceof RubicError) {
        throw error;
      }

      throw new UndefinedError();
    }
  }

  public async deactivate(): Promise<void> {
    await this.wallet.disconnect();
    this.storeService.deleteItem('RUBIC_CHAIN_ID');
    super.deactivate();
  }
}
