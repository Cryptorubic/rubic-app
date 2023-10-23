import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableService } from '@features/history/services/table-service/table.service';
import { combineLatestWith } from 'rxjs';
import { map } from 'rxjs/operators';

const crossChinCols = ['from', 'to', 'date', 'statusFrom', 'statusTo', 'provider'] as const;
const onChinCols = ['from', 'to', 'blockchain', 'date', 'status', 'provider'] as const;

@Component({
  selector: 'app-history-table',
  templateUrl: './history-table.component.html',
  styleUrls: ['./history-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryTableComponent {
  public readonly data$ = this.tableService.data$;

  public readonly loading$ = this.tableService.loading$;

  public readonly direction$ = this.tableService.direction$;

  public readonly sorter$ = this.tableService.sorter$;

  public readonly page$ = this.tableService.page$;

  public readonly isCrossChain$ = this.tableService.activeItemIndex$.pipe(
    map(index => index === 0)
  );

  public readonly columns$ = this.isCrossChain$.pipe(
    map(isCrossChain => (isCrossChain ? crossChinCols : onChinCols))
  );

  public readonly total$ = this.tableService.total$;

  public readonly totalPages$ = this.total$.pipe(
    combineLatestWith(this.tableService.size$),
    map(([total, size]) => Math.trunc(total / size) + 1)
  );

  constructor(private readonly tableService: TableService) {}

  public changeDirection(direction: 1 | -1): void {
    this.tableService.onDirection(direction);
  }

  public changeSorting(sorting: unknown): void {
    const sort = sorting as (typeof crossChinCols)[number];
    if (sort === 'date') {
      this.tableService.onSorting('created_at');
    }
  }

  public changePage(page: number): void {
    this.tableService.onPage(page);
  }

  protected readonly prompt = prompt;
}
