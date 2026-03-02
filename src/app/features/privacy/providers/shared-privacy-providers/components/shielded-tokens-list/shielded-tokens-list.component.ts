import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ShieldedBalanceToken } from './models/shielded-balance-token';

@Component({
  selector: 'app-shielded-tokens-list',
  templateUrl: './shielded-tokens-list.component.html',
  styleUrls: ['./shielded-tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShieldedTokensListComponent {
  @Input({ required: true }) public readonly tokens: ShieldedBalanceToken[];
}
