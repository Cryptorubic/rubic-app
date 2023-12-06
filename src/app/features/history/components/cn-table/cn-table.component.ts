import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { CnTableService } from '@features/history/services/cn-table-service/cn-table.service';
import { CnTableData } from '@features/history/models/cn-table-data';
import { NAVIGATOR } from '@ng-web-apis/common';
import { timer } from 'rxjs';

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

  public hintsVisibility: Record<string, boolean> = {};

  constructor(
    private readonly tableService: CnTableService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {}

  public getItem(innerItem: Partial<Record<keyof CnTableData, RubicAny>>): CnTableData {
    return innerItem as unknown as CnTableData;
  }

  public copyToClipboard(txId: string): void {
    this.showHint(txId);
    this.navigator.clipboard.writeText(txId);
  }

  private showHint(txId: string): void {
    this.hintsVisibility[txId] = true;

    timer(1500).subscribe(() => {
      this.hintsVisibility[txId] = false;
      this.cdr.markForCheck();
    });
  }
}
