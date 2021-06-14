import { Component } from '@angular/core';
import { TokensSelectService } from '../../../features/tokens-select/services/tokens-select.service';

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

  constructor(private tokensSelectService: TokensSelectService) {}

  openTokensSelect() {
    this.tokensSelectService
      .showDialog()
      .subscribe(token =>
        alert(`Token ${token.symbol} in ${token.blockchain} blockchain selected`)
      );
  }
}
