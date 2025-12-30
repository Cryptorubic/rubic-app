import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { OnChainTableService } from '@features/history/services/on-chain-table-service/on-chain-table.service';
import { OnChainTableData } from '@features/history/models/on-chain-table-data';
import { Observable } from 'rxjs';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';

const onChinCols = ['from', 'to', 'blockchain', 'date', 'status', 'provider'] as const;

@Component({
  selector: 'app-on-chain-desktop-table',
  templateUrl: './on-chain-desktop-table.component.html',
  styleUrls: ['./on-chain-desktop-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OnChainDesktopTableComponent {
  @Input({ required: true }) device: 'mobile' | 'desktop' | 'tablet';

  public readonly data$: Observable<OnChainTableData[]> = this.tableService.data$;

  public readonly loading$ = this.tableService.loading$;

  public readonly direction$ = this.tableService.direction$;

  public readonly sorter$ = this.tableService.sorter$;

  public readonly columns = onChinCols;

  public readonly page$ = this.tableService.page$;

  public readonly totalPages$ = this.tableService.totalPages$;

  constructor(private readonly tableService: OnChainTableService) {}

  public changeDirection(direction: 1 | -1): void {
    this.tableService.onDirection(direction);
  }

  public changePage(page: number): void {
    this.tableService.onPage(page);
  }

  public changeSorting(sorting: unknown): void {
    const sort = sorting as (typeof onChinCols)[number];
    if (sort === 'date') {
      this.tableService.onSorting('created_at');
    }
  }

  public getItem(innerItem: Partial<Record<keyof OnChainTableData, RubicAny>>): OnChainTableData {
    return innerItem as unknown as OnChainTableData;
  }

  public onImageError($event: Event): void {
    TokensFacadeService.onTokenImageError($event);
  }
}
