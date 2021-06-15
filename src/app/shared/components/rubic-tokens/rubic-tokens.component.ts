import { Component, Input } from '@angular/core';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent {
  @Input() tokenType: 'from' | 'to';

  public selectedToken: IToken;

  constructor(private tokensSelectService: TokensSelectService) {}

  openTokensSelect() {
    this.tokensSelectService
      .showDialog(this.tokenType)
      .subscribe(token => (this.selectedToken = token));
  }
}
