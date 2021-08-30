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
import { BehaviorSubject, Subscription } from 'rxjs';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTokensComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() formType: 'from' | 'to';

  private _tokens: AvailableTokenAmount[];

  @Input() formService: FormService;

  @Input() set tokens(value: AvailableTokenAmount[]) {
    if (value) {
      this._tokens = value;
      if (this.tokens$) {
        this.tokens$.next(value);
      }
    }
  }

  @Input() formServiceTokens: FormService;

  @Input() allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  @Input() disabled = false;

  @Input() idPrefix: string = '';

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: Token;

  public buttonHovered: boolean = null;

  private $formSubscription: Subscription;

  private readonly tokens$: BehaviorSubject<AvailableTokenAmount[]>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensSelectService: TokensSelectService
  ) {
    this.tokens$ = new BehaviorSubject<AvailableTokenAmount[]>(null);
  }

  public ngOnInit(): void {
    this.setFormValues(this.formService.commonTrade.controls.input.value);
    this.$formSubscription = this.formService.commonTrade.controls.input.valueChanges.subscribe(
      formValue => {
        this.setFormValues(formValue);
      }
    );
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
    this.tokens$.next(this._tokens);
    const { fromBlockchain, toBlockchain } = this.formService.inputValue;
    const currentBlockchain = this.formType === 'from' ? fromBlockchain : toBlockchain;

    this.tokensSelectService
      .showDialog(
        this.tokens$,
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
