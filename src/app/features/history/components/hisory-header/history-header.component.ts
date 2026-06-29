import { ChangeDetectionStrategy, Component } from '@angular/core';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { distinctUntilChanged, map, startWith, tap } from 'rxjs/operators';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { OnChainTableService } from '@features/history/services/on-chain-table-service/on-chain-table.service';
import { CommonTableService } from '@features/history/services/common-table-service/common-table.service';
import { combineLatest } from 'rxjs';
import { WalletConnectorService } from '@app/core/services/wallets/wallet-connector-service/wallet-connector.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { compareAddresses } from '@cryptorubic/core';

@Component({
  standalone: false,
  selector: 'app-history-header',
  templateUrl: './history-header.component.html',
  styleUrls: ['./history-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryHeaderComponent {
  public readonly activeItemIndex$ = this.commonTableService.activeItemIndex$;

  public readonly statusFilterCtrl = this.crossChainTableService.statusFilter;

  public readonly walletAddressCtrl = this.commonTableService.walletAddressCtrl;

  public readonly isCrossChain$ = this.commonTableService.activeItemIndex$.pipe(
    map(el => el === 0)
  );

  public readonly items = Array.from(
    new Set(['All', ...Object.values(txStatusMapping).map(el => el.label)])
  );

  public readonly availableWalletAddresses$ = this.walletConnectorService.activeWallets$.pipe(
    tap(activeWallets => {
      const walletNotSelected = !this.walletAddressCtrl.value;
      if (walletNotSelected && activeWallets.length) {
        this.walletAddressCtrl.setValue(activeWallets[0].address);
      }
    }),
    map(activeWallets => activeWallets.map(activeWallet => activeWallet.address)),
    startWith([])
  );

  constructor(
    private readonly crossChainTableService: CrossChainTableService,
    private readonly onChainTableService: OnChainTableService,
    private readonly commonTableService: CommonTableService,
    private readonly walletConnectorService: WalletConnectorService
  ) {
    combineLatest([this.statusFilterCtrl.valueChanges, this.walletAddressCtrl.valueChanges])
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => {
        this.crossChainTableService.onPage(0);
      });

    this.walletConnectorService.activeWallets$
      .pipe(takeUntilDestroyed())
      .subscribe(activeWallets => {
        console.log('activeWallets ==>', { activeWallets, value: this.walletAddressCtrl.value });
        const selectedWallet = this.walletAddressCtrl.value;
        if (!selectedWallet && activeWallets.length) {
          console.log('walletAddressCtrl.setValue_0 ==>', activeWallets[0].address);
          this.walletAddressCtrl.patchValue(activeWallets[0].address);
          return;
        }
        const selectedWalletStillConnected = activeWallets.some(w =>
          compareAddresses(w.address, selectedWallet)
        );
        if (!selectedWalletStillConnected) {
          console.log('selectedWalletStillConnected_set ==>');
          this.walletAddressCtrl.setValue(activeWallets.length ? activeWallets[0].address : '');
          return;
        }
      });
  }

  public onClick(index: 0 | 1 | 2): void {
    this.commonTableService.activeItemIndex = index;
    this.crossChainTableService.onPage(0);
    this.onChainTableService.onPage(0);
  }
}
