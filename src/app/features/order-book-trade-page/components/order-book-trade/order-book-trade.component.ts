import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TradeData } from '../../../../core/services/order-book/types';

@Component({
  selector: 'app-order-book-trade',
  templateUrl: './order-book-trade.component.html',
  styleUrls: ['./order-book-trade.component.scss']
})
export class OrderBookTradeComponent implements OnInit {
  public tradeData: TradeData;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.tradeData = this.route.snapshot.data.tradeData;
  }
}
