import { Component } from '@angular/core';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent {
  public selectedToken = {
    symbol: 'ETH',
    imgUrl: 'assets/images/icons/eth-logo.svg'
  };

  constructor() {}
}
