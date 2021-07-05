import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Token } from 'src/app/shared/models/tokens/Token';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { of, Subscription } from 'rxjs';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss']
})
export class RubicTokensComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() tokenType: 'from' | 'to';

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() disabled = false;

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: Token;

  private $formSubscription: Subscription;

  constructor(private tokensSelectService: TokensSelectService) {}

  ngOnInit() {
    this.setFormValues(this.formService.commonTrade.controls.input.value);
    this.$formSubscription = this.formService.commonTrade.controls.input.valueChanges.subscribe(
      formValue => {
        this.setFormValues(formValue);
      }
    );
  }

  private setFormValues(formValue: ISwapFormInput): void {
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.selectedToken = formValue[formKey];
  }

  ngOnDestroy() {
    this.$formSubscription.unsubscribe();
  }

  openTokensSelect() {
    const { fromBlockchain, toBlockchain } = this.formService.commonTrade.controls.input.value;
    const [currentBlockchain, enabledCustomTokenBlockchain] =
      this.tokenType === 'from' ? [fromBlockchain, toBlockchain] : [toBlockchain, fromBlockchain];

    this.tokensSelectService
      .showDialog(of(this.tokens), currentBlockchain, enabledCustomTokenBlockchain)
      .subscribe((token: Token) => {
        if (token) {
          this.selectedToken = token;
          if (this.tokenType === 'from') {
            this.formService.commonTrade.controls.input.patchValue({
              fromBlockchain: token.blockchain,
              fromToken: token
            });
          } else {
            this.formService.commonTrade.controls.input.patchValue({
              toToken: token,
              toBlockchain: token.blockchain
            });
          }
        }
      });
  }

  clearToken() {
    this.selectedToken = null;
    const formKey = this.tokenType === 'from' ? 'fromToken' : 'toToken';
    this.formService.commonTrade.controls.input.patchValue({ [formKey]: null });
  }
}
