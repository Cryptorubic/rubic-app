import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { Tokens } from '@shared/models/tokens/tokens';
import { TokensSelectService } from 'src/app/features/tokens-select/services/tokens-select.service';
import { BehaviorSubject } from 'rxjs';
import AddressType from '@shared/models/blockchain/address-type';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { FormService } from '@shared/models/swaps/form-service';
import { ISwapFormInput } from '@shared/models/swaps/swap-form';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { takeUntil } from 'rxjs/operators';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { compareObjects } from 'src/app/shared/utils/utils';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { DefaultTokenImage } from '@shared/constants/tokens/default-token-image';

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

  public readonly DEFAULT_TOKEN_IMAGE = DefaultTokenImage;

  @Input() set tokens(value: AvailableTokenAmount[]) {
    const deepEquality = compareObjects(value, this._tokens$.value);
    if (!deepEquality) {
      this._tokens$.next(value);
    }
  }

  @Input() set favoriteTokens(value: AvailableTokenAmount[]) {
    const deepEquality = compareObjects(value, this._favoriteTokens$.value);
    if (!deepEquality) {
      this._favoriteTokens$.next(value);
    }
  }

  @Input() formService: FormService;

  @Input() allowedBlockchains: BLOCKCHAIN_NAME[] | undefined;

  @Input() disabled = false;

  @Input() idPrefix: string = '';

  public ADDRESS_TYPE = AddressType;

  public selectedToken: Tokens;

  public buttonHovered: boolean = null;

  public iframeForceDisabled = false;

  private readonly _tokens$: BehaviorSubject<AvailableTokenAmount[]> = new BehaviorSubject<
    AvailableTokenAmount[]
  >([]);

  public readonly tokensSubject$ = this._tokens$.asObservable();

  private readonly _favoriteTokens$: BehaviorSubject<AvailableTokenAmount[]> = new BehaviorSubject<
    AvailableTokenAmount[]
  >([]);

  public readonly favoriteTokensSubject$ = this._favoriteTokens$.asObservable();

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensSelectService: TokensSelectService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService,
    private readonly destroy$: TuiDestroyService
  ) {}

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
        this._tokens$.asObservable(),
        this._favoriteTokens$.asObservable(),
        this.formType,
        currentBlockchain,
        this.formService.input,
        this.allowedBlockchains,
        idPrefix
      )
      .subscribe((token: TokenAmount) => {
        if (token) {
          this.tokensService.addToken(token);
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

  public onImageError($event: Event): void {
    this.tokensService.onTokenImageError($event);
  }
}
