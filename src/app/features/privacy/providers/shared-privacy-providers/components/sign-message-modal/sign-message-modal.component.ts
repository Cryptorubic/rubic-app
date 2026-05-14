import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sign-message-modal',
  templateUrl: './sign-message-modal.component.html',
  styleUrls: ['./sign-message-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignMessageModalComponent {
  public readonly isSdkLoading$: Observable<boolean>;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      boolean,
      {
        signMessage: () => Promise<boolean>;
        isSdkLoading$: Observable<boolean>;
      }
    >
  ) {
    this.isSdkLoading$ = context.data.isSdkLoading$;
  }

  public async sign(): Promise<void> {
    try {
      const isMsgSigned = await this.context.data.signMessage();
      if (isMsgSigned) this.context.completeWith(true);
    } catch {}
  }
}
