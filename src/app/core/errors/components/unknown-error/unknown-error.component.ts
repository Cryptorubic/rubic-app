import { WA_NAVIGATOR } from '@ng-web-apis/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { timer } from 'rxjs';
import { ERROR_TYPE } from '@core/errors/models/error-type';
import { RubicError } from '@core/errors/models/rubic-error';

@Component({
  selector: 'polymorpheus-unknown-error',
  templateUrl: './unknown-error.component.html',
  styleUrls: ['./unknown-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class UnknownErrorComponent {
  public error: RubicError<ERROR_TYPE>;

  public hintShown: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, RubicError<ERROR_TYPE>>,
    private readonly cdr: ChangeDetectorRef,
    @Inject(WA_NAVIGATOR) private readonly navigator: Navigator
  ) {
    this.error = context.data;
  }

  /**
   * Copy error message to clipboard.
   */
  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(this.error.message);
  }

  /**
   * Show copy to clipboard hint.
   */
  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.markForCheck();
    });
  }
}
