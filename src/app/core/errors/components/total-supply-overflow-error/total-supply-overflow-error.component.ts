import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-total-supply-overflow-error',
  templateUrl: './total-supply-overflow-error.component.html',
  styleUrls: ['./total-supply-overflow-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class TotalSupplyOverflowErrorComponent {
  public readonly tokenSymbol: string;

  public readonly totalSupply: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { tokenSymbol: string; totalSupply: string }>
  ) {
    this.tokenSymbol = context.data.tokenSymbol;
    this.totalSupply = context.data.totalSupply;
  }
}
