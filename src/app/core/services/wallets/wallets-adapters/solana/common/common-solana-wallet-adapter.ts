import { SolanaWallet } from '@core/services/wallets/wallets-adapters/solana/models/solana-wallet-types';
import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainName, CHAIN_TYPE } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { Connection } from '@solana/web3.js';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';

export abstract class CommonSolanaWalletAdapter<
  T extends SolanaWallet
> extends CommonWalletAdapter<T | null> {
  public readonly chainType = CHAIN_TYPE.SOLANA;

  protected constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    public readonly connection: Connection
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
  }
}
