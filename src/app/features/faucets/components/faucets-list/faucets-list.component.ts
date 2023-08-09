import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Faucet } from '@features/faucets/models/faucet';

@Component({
  selector: 'app-faucets-list',
  templateUrl: './faucets-list.component.html',
  styleUrls: ['./faucets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaucetsListComponent {
  @Input() loading: boolean = true;

  @Input() faucets: Faucet[] | null;

  constructor() {}
}
