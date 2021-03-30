import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OrderBookTradeData } from 'src/app/features/order-book-trade-page/models/trade-data';
import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';
import { TokenValueType } from '../../models/order-book/tokens';

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

  @Input() public title: string;

  @Output() public refreshTableEvent: EventEmitter<void>;

  @Output() public selectTokenEvent: EventEmitter<TokenValueType>;

  constructor() {
    this.refreshTableEvent = new EventEmitter<void>();
    this.selectTokenEvent = new EventEmitter<TokenValueType>();
  }

  public getChainIcon(name: BLOCKCHAIN_NAME): string {
    return BlockchainsInfo.getBlockchainByName(name).imagePath;
  }

  public selectToken(data: TokenValueType): void {
    this.selectTokenEvent.emit(data);
  }

  public refresnOrderBooks(): void {
    this.refreshTableEvent.emit();
  }
}
