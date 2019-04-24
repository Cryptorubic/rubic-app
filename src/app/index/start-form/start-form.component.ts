import {Component, OnDestroy, OnInit} from '@angular/core';
import {Web3Service} from '../../services/web3/web3.service';

@Component({
  selector: 'app-start-form',
  templateUrl: './start-form.component.html',
  styleUrls: ['./start-form.component.scss']
})
export class StartFormComponent implements OnInit, OnDestroy {
  public tokensData;
  constructor(
    private web3Service: Web3Service
  ) {
    const draftData = localStorage.getItem('form_values');
    this.tokensData = draftData ? JSON.parse(draftData).tokens_info : {
      base: {
        token: {}
      },
      quote: {
        token: {}
      }
    };
  }

  public changedToken() {
    localStorage.setItem('form_values', JSON.stringify({tokens_info: this.tokensData}));
  }

  ngOnInit() {
    if (!this.tokensData.base.token.address) {
      this.web3Service.getFullTokenInfo('0xB8c77482e45F1F44dE1745F52C74426C631bDD52').then((result) => {
        this.tokensData.base.token = result;
        this.changedToken();
      });
    }
    if (!this.tokensData.quote.token.address) {
      this.web3Service.getFullTokenInfo('0x0000000000085d4780B73119b644AE5ecd22b376').then((result) => {
        this.tokensData.quote.token = result;
        this.changedToken();
      });
    }
  }

  ngOnDestroy(): void {
    this.changedToken();
  }
}
