import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CHAIN_TYPES_FILTERS } from '../../constants/chain-type-filters';
import { WalletFilterConfig } from '../../models/models';
import { CommonWalletAdapter } from '@app/core/services/wallets/wallets-adapters/common-wallet-adapter';

@Component({
  selector: 'app-chain-types-list',
  templateUrl: './chain-types-list.component.html',
  styleUrls: ['./chain-types-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChainTypesListComponent {
  @Input() selectedFilter: WalletFilterConfig = CHAIN_TYPES_FILTERS.ALL;

  @Input() activeWallets: CommonWalletAdapter[] = [];

  @Output() chainTypeChanged = new EventEmitter<WalletFilterConfig>();

  public readonly chainTypeFilters = Object.values(CHAIN_TYPES_FILTERS);

  public selectFilter(filter: WalletFilterConfig): void {
    this.chainTypeChanged.emit(filter);
  }
}
