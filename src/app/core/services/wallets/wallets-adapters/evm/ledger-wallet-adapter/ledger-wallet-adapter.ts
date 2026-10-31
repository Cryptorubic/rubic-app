import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { SignRejectError } from '@core/errors/models/provider/sign-reject-error';
import { NgZone } from '@angular/core';
import { BlockchainName, BlockchainsInfo, EvmBlockchainName } from '@cryptorubic/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EvmWalletAdapter } from '@core/services/wallets/wallets-adapters/evm/common/evm-wallet-adapter';
import { RubicAny } from '@app/shared/models/utility-types/rubic-any';
import { RubicError } from '@core/errors/models/rubic-error';
import { LedgerError } from '@app/core/errors/models/provider/ledger-error';
import { LedgerSdkInitalizer } from './ledger-sdk-initializer';

export class LedgerWalletAdapter extends EvmWalletAdapter {
  public readonly walletName = WALLET_NAME.LEDGER;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
    LedgerSdkInitalizer.init();
  }

  public async activate(): Promise<void> {
    try {
      const provider = await this.getProvider({ provider: 'ledger wallet' });

      this.wallet = provider;
      if (!this.wallet) throw new LedgerError();

      const accounts = (await this.wallet.request({ method: 'eth_requestAccounts' })) as RubicAny;
      const chain = await this.wallet.request({ method: 'eth_chainId' });
      this.isEnabled = true;

      [this.selectedAddress] = accounts;
      this.selectedChain =
        (BlockchainsInfo.getBlockchainNameById(chain) as EvmBlockchainName) ?? null;
      this.onAddressChanges$.next(this.selectedAddress);
      this.onNetworkChanges$.next(this.selectedChain);

      this.initSubscriptionsOnChanges();
    } catch (error) {
      if (error.code === 4001 || error.message?.toLowerCase().includes('user closed the modal')) {
        throw new SignRejectError();
      }
      if (error instanceof RubicError) throw error;
      throw new LedgerError();
    }
  }
}
