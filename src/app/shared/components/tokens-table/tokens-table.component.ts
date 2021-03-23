import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { CoinsFilterComponent } from '../coins-filter/coins-filter.component';

@Component({
  selector: 'app-tokens-table',
  templateUrl: './tokens-table.component.html',
  styleUrls: ['./tokens-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokensTableComponent {
  @Input() public tableData: OrderBookTradeData[];

  @Input() public displayedColumns: string[];

  @Input() public columnsSizes: string[];

  @Input() public tableLoading: boolean;

  @Output() public refreshTableEvent: EventEmitter<void>;

  @ViewChild(CoinsFilterComponent) public filter: CoinsFilterComponent;

  constructor() {
    this.refreshTableEvent = new EventEmitter<void>();
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public refresnOrderBooks(): void {
    this.refreshTableEvent.emit();
  }
}
