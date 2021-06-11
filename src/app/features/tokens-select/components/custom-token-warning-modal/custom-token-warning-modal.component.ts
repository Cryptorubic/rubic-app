import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { TokenAmount } from '../../../../shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-custom-token-warning-modal',
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

  public onAccept() {
    this.context.completeWith(true);
  }

  public onDecline() {
    this.context.completeWith(false);
  }
}
