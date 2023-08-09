import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Faucet } from '@features/faucets/models/faucet';

@Component({
  selector: 'app-faucets-list',
  templateUrl: './faucets-list.component.html',
  styleUrls: ['./faucets-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaucetsListComponent {
  private readonly fakeFaucet = {
    token: { address: '', symbol: 'ETH', icon_url: '' },
    url: '',
    name: 'Binance Smart Chain'
  };

  public fakeFaucets = new Array(3).fill(this.fakeFaucet);

  @Input() loading: boolean = true;

  @Input() faucets: Faucet[] = [];

  constructor() {}
}
