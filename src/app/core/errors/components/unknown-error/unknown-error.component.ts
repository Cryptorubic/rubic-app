import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { ERROR_TYPE } from 'src/app/core/errors/models/error-type';
import { RubicError } from 'src/app/core/errors/models/RubicError';
import { timer } from 'rxjs';
import { NAVIGATOR } from 'src/app/core/models/navigator';

@Component({
  selector: 'app-metamask-error',
  templateUrl: './unknown-error.component.html',
  styleUrls: ['./unknown-error.component.scss']
})
export class UnknownErrorComponent {
  public error: RubicError<ERROR_TYPE>;

  public hintShown: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, RubicError<ERROR_TYPE>>,
    private readonly cdr: ChangeDetectorRef,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {
    this.error = context.data;
  }

  /**
   *  @description Copy error message to clipboard.
   */
  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(this.error.message);
  }

  /**
   * @description Show copy to clipboard hint.
   */
  private showHint(): void {
    this.hintShown = true;
    timer(1500).subscribe(() => {
      this.hintShown = false;
      this.cdr.detectChanges();
    });
  }
}
