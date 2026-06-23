import { StandardWalletAdapter } from '@core/services/wallets/wallets-adapters/standard-adapter/standard-wallet-adapter';
import { BLOCKCHAIN_NAME, BlockchainName, CHAIN_TYPE } from '@cryptorubic/core';
import { BehaviorSubject } from 'rxjs';
import { ErrorsService } from '@core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { StoreService } from '@app/core/services/store/store.service';
import { BitcoinStandardAdapter } from './bitcoin-standard-adapter';
import { BitcoinFeatures } from './models/bitcoin-features';
import { HttpService } from '@app/core/services/http/http.service';

export abstract class BitcoinStandardWalletAdapter extends StandardWalletAdapter<BitcoinFeatures> {
  public readonly chainType = CHAIN_TYPE.BITCOIN;

  protected readonly blockchainName = BLOCKCHAIN_NAME.BITCOIN;

  protected readonly chainName = 'bitcoin:mainnet';

  public constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow,
    storeService: StoreService,
    httpService: HttpService
  ) {
    super(
      onAddressChanges$,
      onNetworkChanges$,
      errorsService,
      zone,
      window,
      storeService,
      BitcoinStandardAdapter,
      httpService
    );
  }
}
