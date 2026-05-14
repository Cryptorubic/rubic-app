import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

@Component({
  selector: 'app-max-gas-price-overflow-error',
  templateUrl: './max-gas-price-overflow-error.component.html',
  styleUrls: ['./max-gas-price-overflow-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MaxGasPriceOverflowErrorComponent {
  public readonly toBlockchain: string;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<void, { toBlockchain: string }>
  ) {
    this.toBlockchain = context.data.toBlockchain;
  }
}
