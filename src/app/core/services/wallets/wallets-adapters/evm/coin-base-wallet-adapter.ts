import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { UndefinedError } from '@core/errors/models/undefined.error';
import { RubicError } from '@core/errors/models/rubic-error';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from 'rubic-sdk';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { ProviderInterface } from '@coinbase/wallet-sdk';
import { CoinBaseError } from '@core/errors/models/provider/coinbase-error';

export class CoinBaseWalletAdapter extends EvmWalletAdapter<ProviderInterface> {
  public readonly walletName = WALLET_NAME.COIN_BASE;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorService, zone, window);
  }

  public async activate(): Promise<void> {
    try {
      const provider = await this.getProvider('coinbase wallet');

      if (!provider) {
        throw new CoinBaseError();
      }
      this.wallet = provider;
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
    super.deactivate();
  }
}
