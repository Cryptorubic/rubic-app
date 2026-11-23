import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { BtcWallet } from '@cryptorubic/web3';

export abstract class CommonBitcoinWalletAdapter<
  T extends BtcWallet
> extends CommonWalletAdapter<T | null> {
  public readonly chainType = CHAIN_TYPE.BITCOIN;

  protected constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }

  public async switchChain(_chainId: string): Promise<void | never> {
    throw new Error('Method is not supported by wallet');
  }

  public async addChain(_params: AddEvmChainParams): Promise<void | never> {
    throw new Error('Method is not supported by wallet');
  }
}
