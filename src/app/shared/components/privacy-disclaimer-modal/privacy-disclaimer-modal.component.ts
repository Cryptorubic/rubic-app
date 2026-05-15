import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-privacy-disclaimer-modal',
  templateUrl: './privacy-disclaimer-modal.component.html',
  styleUrls: ['./privacy-disclaimer-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyDisclaimerModalComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, unknown>
  ) {}

  public confirm(): void {
    this.context.completeWith(true);
  }

  public cancel(): void {
    this.context.completeWith(false);
  }
}
