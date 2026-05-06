import { WA_NAVIGATOR } from '@ng-web-apis/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { DepositTableData } from '@app/features/history/models/deposit-table-data';
import { timer } from 'rxjs';

@Component({
  selector: 'app-rubic-badge-with-copy-btn',
  templateUrl: './rubic-badge-with-copy-btn.component.html',
  styleUrls: ['./rubic-badge-with-copy-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class RubicBadgeWithCopyBtnComponent {
  @Input({ required: true }) item: DepositTableData;

  public isHintVisible: boolean = false;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator
  ) {}

  public copyToClipboard(txId: string): void {
    this.showHint();
    this.navigator.clipboard.writeText(txId);
  }

  private showHint(): void {
    this.isHintVisible = true;

    timer(1500).subscribe(() => {
      this.isHintVisible = false;
      this.cdr.markForCheck();
    });
  }
}
