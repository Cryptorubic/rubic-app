import { Component, Input, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../trades-form/trades-form.component';

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent implements OnInit {
  @Input() blockchain: BLOCKCHAIN_NAMES;

  constructor() {}

  ngOnInit() {}
}
