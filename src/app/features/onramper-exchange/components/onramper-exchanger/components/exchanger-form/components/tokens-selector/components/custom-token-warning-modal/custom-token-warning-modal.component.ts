import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';

@Component({
  selector: 'polymorpheus-custom-token-warning-modal',
  templateUrl: './custom-token-warning-modal.component.html',
  styleUrls: ['./custom-token-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenWarningModalComponent {
  public token: TokenAmount;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { token: TokenAmount }>
  ) {
    this.token = context.data.token;
  }

  public onAccept(): void {
    this.context.completeWith(true);
  }

  public onDecline(): void {
    this.context.completeWith(false);
  }
}
