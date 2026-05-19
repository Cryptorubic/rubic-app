import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { MobileNativeModalService } from '@core/modals/services/mobile-native-modal.service';

@Component({
  selector: 'polymorpheus-custom-token-warning-modal',
  templateUrl: './custom-token-warning-modal.component.html',
  styleUrls: ['./custom-token-warning-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomTokenWarningModalComponent {
  public token: BalanceToken;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { token: BalanceToken }>,
    private readonly mobileNativeService: MobileNativeModalService
  ) {
    this.token = context.data.token;
  }

  public onAccept(): void {
    this.mobileNativeService.forceClose();
    this.context.completeWith(true);
  }

  public onDecline(): void {
    this.context.completeWith(false);
  }
}
