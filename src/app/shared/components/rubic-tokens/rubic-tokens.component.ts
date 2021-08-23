import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Token } from 'src/app/shared/models/tokens/Token';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { of, Subscription } from 'rxjs';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTokensComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() formType: 'from' | 'to';

  @Input() tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  @Input() disabled = false;

  @Input() idPrefix: string = '';

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: Token;

  public buttonHovered: boolean = null;

  private $formSubscription: Subscription;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensSelectService: TokensSelectService
  ) {}

  public ngOnInit(): void {
    this.$formSubscription = this.formService.inputValueChanges
      .pipe(startWith(this.formService.inputValue))
      .subscribe(formValue => {
        this.setFormValues(formValue);
      });
  }

  public ngOnDestroy(): void {
    this.$formSubscription.unsubscribe();
  }

  private setFormValues(formValue: ISwapFormInput): void {
    const formKey = this.formType === 'from' ? 'fromToken' : 'toToken';
    this.selectedToken = formValue[formKey];
    this.cdr.detectChanges();
  }

  public openTokensSelect(idPrefix: string): void {
    const { fromBlockchain, toBlockchain } = this.formService.inputValue;
    const currentBlockchain = this.formType === 'from' ? fromBlockchain : toBlockchain;

    this.tokensSelectService
      .showDialog(
        of(this.tokens),
        this.formType,
        currentBlockchain,
        this.formService.input,
        this.allowedBlockchains,
        idPrefix
      )
      .subscribe((token: Token) => {
        if (token) {
          this.selectedToken = token;
          if (this.formType === 'from') {
            this.formService.input.patchValue({
              fromBlockchain: token.blockchain,
              fromToken: token
            });
          } else {
            this.formService.input.patchValue({
              toToken: token,
              toBlockchain: token.blockchain
            });
          }
        }
      });
  }

  public clearToken(): void {
    this.selectedToken = null;
    const formKey = this.formType === 'from' ? 'fromToken' : 'toToken';
    this.formService.input.patchValue({ [formKey]: null });
  }
}
