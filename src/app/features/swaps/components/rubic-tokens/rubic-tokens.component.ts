import { Component, Input } from '@angular/core';
import { IToken } from 'src/app/shared/models/tokens/IToken';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { of } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent {
  @Input() loading: boolean;

  @Input() tokenType: 'from' | 'to';

  @Input() tokens: AvailableTokenAmount[];

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: IToken;

  constructor(
    private tokensSelectService: TokensSelectService,
    private readonly swapFormService: SwapFormService
  ) {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formValue => {
      const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
      this.selectedToken = formValue[formKey];
    });
  }

  openTokensSelect() {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const [currentBlockchain, enabledCustomTokenBlockchain] =
      this.tokenType === 'from' ? [fromBlockchain, toBlockchain] : [toBlockchain, fromBlockchain];

    this.tokensSelectService
      .showDialog(of(this.tokens), currentBlockchain, enabledCustomTokenBlockchain)
      .subscribe((token: IToken) => {
        if (token) {
          this.selectedToken = token;
          if (this.tokenType === 'from') {
            this.swapFormService.commonTrade.controls.input.patchValue({
              fromBlockchain: token.blockchain
            });
            this.swapFormService.commonTrade.controls.input.patchValue({
              fromToken: token
            });
          } else {
            this.swapFormService.commonTrade.controls.input.patchValue({
              toBlockchain: token.blockchain
            });
            this.swapFormService.commonTrade.controls.input.patchValue({
              toToken: token
            });
          }
        }
      });
  }

  clearToken() {
    this.selectedToken = null;
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.swapFormService.commonTrade.controls.input.patchValue({ [formKey]: null });
  }
}
