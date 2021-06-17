import { Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-insufficient-funds-error',
  templateUrl: './insufficient-funds-error.component.html',
  styleUrls: ['./insufficient-funds-error.component.scss']
})
export class InsufficientFundsErrorComponent {
  public readonly tokenSymbol: string;

  public readonly balance: string;

  public readonly requiredBalance: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      void,
      { tokenSymbol: string; balance: string; requiredBalance: string }
    >
  ) {
    this.tokenSymbol = context.data.tokenSymbol;
    this.balance = context.data.balance;
    this.requiredBalance = context.data.requiredBalance;
  }
}
