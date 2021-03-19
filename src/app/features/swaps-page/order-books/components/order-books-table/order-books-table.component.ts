import { Component } from '@angular/core';
import date from 'date-and-time';
import { Observable } from 'rxjs';
import { OrderBooksTableService } from './services/order-books-table.service';

@Component({
  selector: 'app-order-books-table',
  templateUrl: './order-books-table.component.html',
  styleUrls: ['./order-books-table.component.scss']
})
export class OrderBooksTableComponent {
  public readonly $dataSource: Observable<any[]>;

  public readonly $displayedColumns: Observable<string[]>;

  public readonly $columnsSizes: Observable<string[]>;

  constructor(private readonly orderBooksTableService: OrderBooksTableService) {
    this.$dataSource = this.orderBooksTableService.getTableData();
    this.$displayedColumns = this.orderBooksTableService.getTableColumns();
    this.$columnsSizes = this.orderBooksTableService.getTableColumnsSizes();
  }

  public getChainIcon() {
    return './assets/images/icons/coins/eth.png';
  }

  public sortByDate(a: string, b: string): number {
    const date1 = new Date(date.transform(a, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    const date2 = new Date(date.transform(b, 'D-M-YYYY H:m', 'YYYY/MM/DD HH:mm:ss'));
    return date.subtract(date2, date1).toMilliseconds();
  }

  public refresnOrderBooks(): void {}
}
