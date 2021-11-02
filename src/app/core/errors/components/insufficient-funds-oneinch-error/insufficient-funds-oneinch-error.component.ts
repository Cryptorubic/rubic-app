import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-insufficient-funds-oneinch-error',
  templateUrl: './insufficient-funds-oneinch-error.component.html',
  styleUrls: ['./insufficient-funds-oneinch-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InsufficientFundsOneinchErrorComponent {
  public readonly nativeToken: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { nativeToken: string }>
  ) {
    this.nativeToken = context.data.nativeToken;
  }
}
