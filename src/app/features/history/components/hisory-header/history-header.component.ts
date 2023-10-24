import { ChangeDetectionStrategy, Component } from '@angular/core';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { OnChainTableService } from '@features/history/services/on-chain-table-service/on-chain-table.service';
import { CommonTableService } from '@features/history/services/common-table-service/common-table.service';

@Component({
  selector: 'app-history-header',
  templateUrl: './history-header.component.html',
  styleUrls: ['./history-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryHeaderComponent {
  public readonly activeItemIndex$ = this.commonTableService.activeItemIndex$;

  public readonly statusFilter = this.crossChainTableService.statusFilter;

  public readonly isCrossChain$ = this.commonTableService.activeItemIndex$.pipe(
    map(el => el === 0)
  );

  public readonly items = Array.from(
    new Set(['All', ...Object.values(txStatusMapping).map(el => el.label)])
  );

  constructor(
    private readonly crossChainTableService: CrossChainTableService,
    private readonly onChainTableService: OnChainTableService,
    private readonly commonTableService: CommonTableService
  ) {
    this.statusFilter.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.crossChainTableService.onPage(0);
    });
  }

  public onClick(index: 0 | 1): void {
    this.commonTableService.activeItemIndex = index;
    this.crossChainTableService.onPage(0);
    this.onChainTableService.onPage(0);
  }
}
