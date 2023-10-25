import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { CrossChainTableData } from '@features/history/models/cross-chain-table-data';
import { RubicAny } from '@shared/models/utility-types/rubic-any';

const crossChainCols = ['from', 'to', 'date', 'statusFrom', 'statusTo', 'provider'] as const;

@Component({
  selector: 'app-cross-chain-desktop-table',
  templateUrl: './cross-chain-desktop-table.component.html',
  styleUrls: ['./cross-chain-desktop-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CrossChainDesktopTableComponent {
  @Input({ required: true }) device: 'mobile' | 'desktop' | 'tablet';

  public readonly data$ = this.tableService.data$;

  public readonly loading$ = this.tableService.loading$;

  public readonly direction$ = this.tableService.direction$;

  public readonly sorter$ = this.tableService.sorter$;

  public readonly columns = crossChainCols;

  public readonly page$ = this.tableService.page$;

  public readonly totalPages$ = this.tableService.totalPages$;

  constructor(private readonly tableService: CrossChainTableService) {}

  public changeDirection(direction: 1 | -1): void {
    this.tableService.onDirection(direction);
  }

  public changePage(page: number): void {
    this.tableService.onPage(page);
  }

  public changeSorting(sorting: unknown): void {
    const sort = sorting as (typeof crossChainCols)[number];
    if (sort === 'date') {
      this.tableService.onSorting('created_at');
    }
  }

  public getItem(
    innerItem: Partial<Record<keyof CrossChainTableData, RubicAny>>
  ): CrossChainTableData {
    return innerItem as unknown as CrossChainTableData;
  }
}
