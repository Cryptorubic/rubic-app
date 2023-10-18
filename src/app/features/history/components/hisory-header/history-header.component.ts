import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TableService } from '@features/history/services/table-service/table.service';

@Component({
  selector: 'app-history-header',
  templateUrl: './history-header.component.html',
  styleUrls: ['./history-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryHeaderComponent {
  public readonly activeItemIndex$ = this.tableService.activeItemIndex$;

  constructor(private readonly tableService: TableService) {}

  onClick(index: 0 | 1 | 2): void {
    this.tableService.activeItemIndex = index;
  }
}
