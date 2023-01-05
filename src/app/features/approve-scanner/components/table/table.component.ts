import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { ErrorsService } from '@core/errors/errors.service';
import BigNumber from 'bignumber.js';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  public readonly approves$ = this.approveScannerService.visibleApproves$.pipe(
    map(approves => {
      const maxApprove = new BigNumber(2).pow(256).minus(1);
      return approves.map(approve => ({
        ...approve,
        value: maxApprove.eq(approve.value) ? 'Infinity' : approve.value
      }));
    })
  );

  public loading = false;

  constructor(
    private readonly approveScannerService: ApproveScannerService,
    private readonly errorsService: ErrorsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public async handleRevoke(token: string, spender: string): Promise<void> {
    try {
      this.loading = true;
      await this.approveScannerService.revokeApprove(token, spender);
    } catch (err) {
      this.errorsService.catch(err);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
