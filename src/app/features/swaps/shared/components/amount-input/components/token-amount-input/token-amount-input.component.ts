import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { map, takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { isMinimalToken } from '@shared/utils/is-token';
import { Asset } from '@features/swaps/shared/models/form/asset';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent implements OnInit {
  @Input() formType: 'from' | 'to' = 'from';

  @Output() amountUpdated = new EventEmitter<void>();

  @ViewChild('tokenAmount') public readonly tokenAmountInput: ElementRef<HTMLInputElement>;

  public readonly placeholder$ = this.translateService.get('errors.noEnteredAmount');

  private get formattedAmount(): string {
    return this.amount?.value.split(',').join('');
  }

  public readonly DEFAULT_DECIMALS = 18;

  public amount = new FormControl<string>('');

  public selectedToken: TokenAmount;

  public selectedAsset: Asset;

  public readonly showLimitOrderOnChainError$ = combineLatest([
    this.swapFormService.inputValue$
  ]).pipe(
    map(([form]) => {
      const { fromAssetType, toBlockchain } = form;
      return this.formType === 'to' && fromAssetType !== toBlockchain;
    })
  );

  public get isWithTokens(): boolean {
    const { fromAsset, toToken } = this.swapFormService.inputValue;
    return fromAsset && Boolean(toToken);
  }

  public get isOnramper(): boolean {
    return false;
    // return this.swapTypeService.swapMode === SWAP_PROVIDER_TYPE.ONRAMPER;
  }

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    if (this.formType === 'from') {
      this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
        this.updateFormValues(form.fromAsset, form.fromAmount);
      });
    } else {
      combineLatest([this.swapFormService.toToken$, this.swapFormService.toAmount$])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([toToken, toAmount]) => {
          this.updateFormValues(toToken, toAmount);
        });
    }
  }

  private updateFormValues(asset: Asset, amount: BigNumber | null): void {
    if (!amount || amount.isNaN()) {
      this.amount.setValue('');
    } else if (!amount.eq(this.formattedAmount)) {
      this.amount.setValue(amount.toFixed());
    }

    this.selectedAsset = asset;
    this.selectedToken = isMinimalToken(asset) ? asset : null;
    this.cdr.markForCheck();
  }

  public onUserBalanceMaxButtonClick(): void {
    this.amount.setValue(this.selectedToken.amount.toFixed());
  }

  public onAmountChange(amount: string): void {
    this.amount.setValue(amount, { emitViewToModelChange: false });
    this.updateInputValue();
  }

  private updateInputValue(): void {
    const amount =
      this.formType === 'from'
        ? this.swapFormService.inputValue.fromAmount
        : this.swapFormService.outputValue.toAmount;
    const amountKey = this.formType === 'from' ? 'fromAmount' : 'toAmount';
    const controlKey = this.formType === 'from' ? 'inputControl' : 'outputControl';

    if (
      ((amount && !amount.isNaN()) || this.formattedAmount) &&
      !amount?.eq(this.formattedAmount)
    ) {
      this.swapFormService[controlKey].patchValue({
        [amountKey]: new BigNumber(this.formattedAmount)
      });
      this.amountUpdated.emit();
    }
  }
}
