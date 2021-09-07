import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Token } from 'src/app/shared/models/tokens/Token';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { BehaviorSubject } from 'rxjs';
import ADDRESS_TYPE from 'src/app/shared/models/blockchain/ADDRESS_TYPE';
import { AvailableTokenAmount } from 'src/app/shared/models/tokens/AvailableTokenAmount';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { ISwapFormInput } from 'src/app/shared/models/swaps/ISwapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { takeUntil } from 'rxjs/operators';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { Utils } from 'src/app/shared/models/utils/utils';

@Component({
  selector: 'app-rubic-tokens',
  templateUrl: './rubic-tokens.component.html',
  styleUrls: ['./rubic-tokens.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class RubicTokensComponent implements OnInit {
  @Input() loading: boolean;

  @Input() formType: 'from' | 'to';

  @Input() set tokens(value: AvailableTokenAmount[]) {
    const lengthEquality = value.length === this.tokensSubject.value.length;
    const deepEquality = new Utils().compareObjects(value, this.tokensSubject.value);
    if (!lengthEquality && !deepEquality) {
      this.tokensSubject.next(value);
    }
  }

  @Input() formService: FormService;

  @Input() allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  @Input() disabled = false;

  @Input() idPrefix: string = '';

  public ADDRESS_TYPE = ADDRESS_TYPE;

  public selectedToken: Token;

  public buttonHovered: boolean = null;

  public iframeForceDisabled = false;

  public tokensSubject: BehaviorSubject<AvailableTokenAmount[]>;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensSelectService: TokensSelectService,
    private readonly queryParamsService: QueryParamsService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.tokensSubject = new BehaviorSubject<AvailableTokenAmount[]>([]);
  }

  public ngOnInit(): void {
    this.setFormValues(this.formService.inputValue);
    this.formService.inputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(formValue => {
      this.setFormValues(formValue);
    });
    this.queryParamsService.tokensSelectionDisabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hideSelectionFrom, hideSelectionTo]) => {
        if (this.formType === 'from') {
          this.iframeForceDisabled = hideSelectionFrom;
        } else {
          this.iframeForceDisabled = hideSelectionTo;
        }
        this.cdr.markForCheck();
      });
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
        this.tokensSubject,
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
