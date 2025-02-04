import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { DepositTableService } from '../../services/cn-table-service/deposit-table.service';
import { DepositTableData } from '../../models/deposit-table-data';

const cols = ['from', 'to', 'date', 'status', 'receiver', 'tradeType'] as const;

@Component({
  selector: 'app-deposit-table',
  templateUrl: './deposit-table.component.html',
  styleUrls: ['./deposit-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTableComponent {
  @Input({ required: true }) device: 'mobile' | 'desktop' | 'tablet';

  public readonly data$ = this.tableService.data$;

  public readonly loading$ = this.tableService.loading$;

  public readonly columns = cols;

  constructor(private readonly tableService: DepositTableService) {}

  public getItem(innerItem: Partial<Record<keyof DepositTableData, RubicAny>>): DepositTableData {
    return innerItem as unknown as DepositTableData;
  }
}
