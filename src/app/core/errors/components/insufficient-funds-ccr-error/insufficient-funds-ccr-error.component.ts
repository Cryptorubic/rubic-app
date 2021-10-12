import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-insufficient-funds-ccr-error',
  templateUrl: './insufficient-funds-ccr-error.component.html',
  styleUrls: ['./insufficient-funds-ccr-error.component.scss']
})
export class InsufficientFundsCcrErrorComponent {
  public readonly nativeToken: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { nativeToken: string }>
  ) {
    this.nativeToken = context.data.nativeToken;
  }
}
