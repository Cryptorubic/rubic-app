import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableService } from '@features/history/services/table-service/table.service';
import { txStatusMapping } from '@features/history/models/tx-status-mapping';
import { distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-history-header',
  templateUrl: './history-header.component.html',
  styleUrls: ['./history-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryHeaderComponent {
  public readonly activeItemIndex$ = this.tableService.activeItemIndex$;

  public readonly statusFilter = this.tableService.statusFilter;

  public readonly isCrossChain$ = this.tableService.activeItemIndex$.pipe(map(el => el === 0));

  public readonly items = Array.from(
    new Set(['All', ...Object.values(txStatusMapping).map(el => el.label)])
  );

  constructor(private readonly tableService: TableService) {
    this.statusFilter.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.tableService.onPage(0);
    });
  }

  public onClick(index: 0 | 1): void {
    this.tableService.activeItemIndex = index;
    this.tableService.onPage(0);
  }
}
