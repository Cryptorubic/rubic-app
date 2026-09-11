import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input
} from '@angular/core';
import { WA_NAVIGATOR } from '@ng-web-apis/common';
import { timer } from 'rxjs';

@Component({
  selector: 'app-field-with-copy-btn',
  standalone: false,
  templateUrl: './field-with-copy-btn.component.html',
  styleUrl: './field-with-copy-btn.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldWithCopyBtnComponent {
  @Input({ required: true }) visibleText: string = '';

  @Input() textToCopy: string = '';

  @Input() bgColor: string = '#1B1B22';

  public copied: boolean = false;

  constructor(
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator,
    private readonly cdr: ChangeDetectorRef
  ) {}

  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(this.textToCopy);
  }

  private showHint(): void {
    this.copied = true;
    timer(1500).subscribe(() => {
      this.copied = false;
      this.cdr.markForCheck();
    });
  }
}
