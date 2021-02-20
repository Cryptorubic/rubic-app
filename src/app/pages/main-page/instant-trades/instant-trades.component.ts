import { Component, Input, OnInit } from '@angular/core';
import { BLOCKCHAIN_NAMES } from '../trades-form/types';
import { List } from 'immutable';
import { TokensService } from '../../../services/backend/tokens-service/tokens.service';
import { SwapToken } from '../../../services/backend/tokens-service/types';

@Component({
  selector: 'app-instant-trades',
  templateUrl: './instant-trades.component.html',
  styleUrls: ['./instant-trades.component.scss']
})
export class InstantTradesComponent implements OnInit {
  @Input() blockchain: BLOCKCHAIN_NAMES;
  public tokens = List<SwapToken>([]);

  constructor(private tokenService: TokensService) {
    tokenService.tokens.subscribe(tokens => (this.tokens = tokens));
  }

  ngOnInit() {}
}
