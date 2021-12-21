import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-rpc-error',
  templateUrl: './rpc-error.component.html',
  styleUrls: ['./rpc-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RpcErrorComponent {
  public readonly questionId: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { questionId: string }>
  ) {
    this.questionId = context.data.questionId;
  }
}
