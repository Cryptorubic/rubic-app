import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PageState } from '@features/testnet-promo/interfaces/page-state.interface';

@Component({
  selector: 'app-pepe',
  templateUrl: './pepe.component.html',
  styleUrls: ['./pepe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PepeComponent {
  @Input({ required: true }) readonly state: PageState;
}
