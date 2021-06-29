import { Component, Input, OnInit } from '@angular/core';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { of } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { SwapForm } from 'src/app/features/swaps/models/SwapForm';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent implements OnInit {
  @Input() loading: boolean;

  @Input() tokenType: 'from' | 'to';

  @Input() tokens: AvailableTokenAmount[];

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: TokenAmount;

  constructor(
    private tokensSelectService: TokensSelectService,
    private readonly swapFormService: SwapFormService
  ) {}

  ngOnInit(): void {
    this.setFormValues(this.swapFormService.commonTrade.controls.input.value);
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(formValue => {
      this.setFormValues(formValue);
    });
  }

  private setFormValues(formValue: SwapForm['input']): void {
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.selectedToken = formValue[formKey];
  }

  public openTokensSelect() {
    const { fromBlockchain, toBlockchain } = this.swapFormService.commonTrade.controls.input.value;
    const [currentBlockchain, enabledCustomTokenBlockchain] =
      this.tokenType === 'from' ? [fromBlockchain, toBlockchain] : [toBlockchain, fromBlockchain];

    this.tokensSelectService
      .showDialog(of(this.tokens), currentBlockchain, enabledCustomTokenBlockchain)
      .subscribe((token: TokenAmount) => {
        if (token) {
          this.selectedToken = token;
          if (this.tokenType === 'from') {
            this.swapFormService.commonTrade.controls.input.patchValue({
              fromBlockchain: token.blockchain,
              fromToken: token
            });
          } else {
            this.swapFormService.commonTrade.controls.input.patchValue({
              toBlockchain: token.blockchain,
              toToken: token
            });
          }
        }
      });
  }

  public clearToken() {
    this.selectedToken = null;
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.swapFormService.commonTrade.controls.input.patchValue({ [formKey]: null });
  }
}
