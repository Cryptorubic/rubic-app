import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CnTableService } from '@features/history/services/cn-table-service/cn-table.service';
import { CnTableData } from '@features/history/models/cn-table-data';

const cnCols = ['from', 'to', 'date', 'status', 'receiver'] as const;

@Component({
  selector: 'app-cn-table',
  templateUrl: './cn-table.component.html',
  styleUrls: ['./cn-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CnTableComponent {
  @Input({ required: true }) device: 'mobile' | 'desktop' | 'tablet';

  public readonly data$ = this.tableService.data$;

  public readonly loading$ = this.tableService.loading$;

  public readonly columns = cnCols;

  constructor(private readonly tableService: CnTableService) {}

  public getItem(innerItem: Partial<Record<keyof CnTableData, RubicAny>>): CnTableData {
    return innerItem as unknown as CnTableData;
  }
}
