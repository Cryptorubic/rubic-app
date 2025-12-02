import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { map } from 'rxjs/operators';
import { combineLatestWith, of } from 'rxjs';
import { CommonTableService } from '@features/history/services/common-table-service/common-table.service';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { OnChainTableService } from '@features/history/services/on-chain-table-service/on-chain-table.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { ModalService } from '@core/modals/services/modal.service';

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTableComponent {
  public readonly isUserActive$ = this.walletConnectorService.addressChange$.pipe(map(Boolean));

  public readonly loading$ = this.crossChainTableService.loading$.pipe(
    combineLatestWith(this.onChainTableService.loading$),
    map(loadings => loadings.some(Boolean))
  );

  // public readonly isCrossChain$ = this.commonTableService.activeItemIndex$.pipe(
  //   map(index => index === 0)
  // );

  // public readonly isOnChain$ = this.commonTableService.activeItemIndex$.pipe(
  //   map(index => index === 1)
  // );

  // public readonly isCn$ = this.commonTableService.activeItemIndex$.pipe(map(index => index === 2));

  public readonly device$ = of(this.window.innerWidth).pipe(
    map(height => {
      if (height > 960) {
        return 'desktop';
      }
      return height > 600 ? 'tablet' : 'mobile';
    })
  );

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly commonTableService: CommonTableService,
    private readonly crossChainTableService: CrossChainTableService,
    private readonly onChainTableService: OnChainTableService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly modalService: ModalService,
    @Inject(Injector) private readonly injector: Injector
  ) {
    const type = this.window.history.state?.type;
    if (type) {
      this.commonTableService.activeItemIndex = type === 'cross-chain' ? 0 : 1;
    }
  }

  public connectWallet(): void {
    this.modalService.openWalletModal(this.injector).subscribe();
  }
}
