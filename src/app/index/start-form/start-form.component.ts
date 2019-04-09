import { Component, OnInit } from '@angular/core';
import {Web3Service} from '../../services/web3/web3.service';

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss']
})
export class StartFormComponent implements OnInit {
  public tokensData;
  constructor(
    private web3Service: Web3Service
  ) {

    const draftData = localStorage.getItem('form_values');
    this.tokensData = draftData ? JSON.parse(draftData).tokens_info : {
      base: {
        token: {},
        amount: '100000'
      },
      quote: {
        token: {},
        amount: '2000000'
      }
    };
  }

  public changedToken() {
    localStorage.setItem('form_values', JSON.stringify({tokens_info: this.tokensData}));
  }

  ngOnInit() {
    if (!this.tokensData.base.token.address) {
      this.web3Service.getFullTokenInfo('0xB8c77482e45F1F44dE1745F52C74426C631bDD52').then((result) => {
        console.log(result);
        this.tokensData.base.token = result;
      });
    }
    if (!this.tokensData.quote.token.address) {
      this.web3Service.getFullTokenInfo('0x0000000000085d4780B73119b644AE5ecd22b376').then((result) => {
        console.log(result);
        this.tokensData.quote.token = result;
      });
    }
  }
}
