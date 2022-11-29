import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { FiatItem } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/fiat-amount-input/components/fiats-selector/models/fiat-item';

@Component({
  selector: 'app-fiats-list',
  templateUrl: './fiats-list.component.html',
  styleUrls: ['./fiats-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class FiatsListComponent {
  @Input() fiats: FiatItem[];

  @Output() fiatSelect = new EventEmitter<FiatItem>();

  constructor() {}

  public onFiat(fiat: FiatItem): void {
    this.fiatSelect.emit(fiat);
  }
}
