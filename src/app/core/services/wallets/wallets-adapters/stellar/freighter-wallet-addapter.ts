import { FREIGHTER_ID, FreighterModule } from '@creit.tech/stellar-wallets-kit';
import { CommonStellarWalletAdapter } from './common/common-stellar-wallet-adapter';
import { WALLET_NAME } from '@app/core/wallets-modal/components/wallets-modal/models/wallet-name';
import { BehaviorSubject } from 'rxjs';
import { BlockchainName } from '@cryptorubic/core';
import { ErrorsService } from '@app/core/errors/errors.service';
import { NgZone } from '@angular/core';
import { RubicWindow } from '@app/shared/utils/rubic-window';
import { WatchWalletChanges } from '@stellar/freighter-api';
export class FreighterWalletAdapter extends CommonStellarWalletAdapter {
  protected readonly walletId = FREIGHTER_ID;

  protected readonly walletModule = new FreighterModule();

  public walletName = WALLET_NAME.FREIGHTER;

  private readonly eventWatcher: WatchWalletChanges;

  constructor(
    onAddressChanges$: BehaviorSubject<string>,
    onNetworkChanges$: BehaviorSubject<BlockchainName | null>,
    errorsService: ErrorsService,
    zone: NgZone,
    window: RubicWindow
  ) {
    super(onAddressChanges$, onNetworkChanges$, errorsService, zone, window);
    this.eventWatcher = new WatchWalletChanges();
  }

  protected override handleEvents(): void {
    this.eventWatcher.watch(params => {
      if (!params.address) {
        this.deactivate();
      } else {
        this.onAddressChanges$.next(params.address);
      }
    });
  }

  public override deactivate(): void {
    this.eventWatcher.stop();
    super.deactivate();
  }
}
