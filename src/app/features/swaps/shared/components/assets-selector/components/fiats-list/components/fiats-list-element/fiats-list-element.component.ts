import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';

@Component({
  selector: 'app-fiats-list-element',
  templateUrl: './fiats-list-element.component.html',
  styleUrls: ['./fiats-list-element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiatsListElementComponent {
  @Input() fiat: FiatAsset;

  constructor() {}
}
