import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { NAVIGATOR } from '@ng-web-apis/common';
import { timer } from 'rxjs';
import { SwapErrorResponseInterface } from 'rubic-sdk';

@Component({
  selector: 'app-simulation-failed-error',
  templateUrl: './simulation-failed-error.component.html',
  styleUrls: ['./simulation-failed-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulationFailedErrorComponent {
  public apiError: SwapErrorResponseInterface;

  public hintShown: boolean;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    context: TuiDialogContext<void, { apiError: SwapErrorResponseInterface }>,
    private readonly cdr: ChangeDetectorRef,
    @Inject(NAVIGATOR) private readonly navigator: Navigator
  ) {
    this.apiError = context.data.apiError;
  }

  /**
   * Copy error message to clipboard.
   */
  public copyToClipboard(): void {
    this.showHint();
    this.navigator.clipboard.writeText(JSON.stringify(this.apiError));
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
