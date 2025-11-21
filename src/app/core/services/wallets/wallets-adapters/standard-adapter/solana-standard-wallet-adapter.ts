import { StandardWalletAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-wallet-adapter';
import { SolanaFeatures } from '@core/services/wallets/wallets-adapters/standard-adapter/models/solana-features';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { SolanaStandardAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/solana-standard-adapter';
import { StoreService } from '@app/core/services/store/store.service';

export abstract class SolanaStandardWalletAdapter extends StandardWalletAdapter<SolanaFeatures> {
  public readonly chainType = CHAIN_TYPE.SOLANA;

  protected readonly blockchainName = BLOCKCHAIN_NAME.SOLANA;

  protected readonly chainName = 'solana:mainnet';

  public constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    storeService: StoreService
  ) {
    super(
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window,
      storeService,
      SolanaStandardAdapter
    );
  }
}
