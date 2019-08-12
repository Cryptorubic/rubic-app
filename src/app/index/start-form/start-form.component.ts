import {Component, EventEmitter, OnDestroy, OnInit} from '@angular/core';
import {Web3Service} from '../../services/web3/web3.service';
import BigNumber from 'bignumber.js';

import {MODE} from '../../app-routing.module';

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss']
})
export class StartFormComponent implements OnInit, OnDestroy {
  constructor(
    private web3Service: Web3Service
  ) {
    this.tokensData = {
      base: {
        token: {}
      },
      quote: {
        token: {}
      }
    };
  }
  public tokensData;

  public quoteTokenChanger = new EventEmitter<any>();
  public baseTokenChanger = new EventEmitter<any>();

  public changedToken() {
    localStorage.setItem('form_new_values', JSON.stringify({tokens_info: this.tokensData}));
  }


  public checkRate(revert?) {
    if (!(this.tokensData.base.token && this.tokensData.quote.token)) {
      return false;
    }
    const baseCoinAmount = new BigNumber(this.tokensData.base.amount)
      .div(Math.pow(10, this.tokensData.base.token.decimals));

    const quoteCoinAmount = new BigNumber(this.tokensData.quote.amount)
      .div(Math.pow(10, this.tokensData.quote.token.decimals));

    return !revert ?
      baseCoinAmount.div(quoteCoinAmount).dp(4) :
      quoteCoinAmount.div(baseCoinAmount).dp(4);
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.changedToken();
  }
}
