import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { takeUntil } from 'rxjs/operators';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { TranslateService } from '@ngx-translate/core';
import { IframeService } from '@core/services/iframe/iframe.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-token-amount-input',
  templateUrl: './token-amount-input.component.html',
  styleUrls: ['./token-amount-input.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TokenAmountInputComponent implements OnInit, AfterViewInit {
  @ViewChild('tokenAmount') public readonly tokenAmountInput: ElementRef<HTMLInputElement>;

  public readonly placeholder$ = this.translateService.get('errors.noEnteredAmount');

  private get formattedAmount(): string {
    return this.amount?.value.split(',').join('');
  }

  public readonly DEFAULT_DECIMALS = 18;

  public amount = new FormControl<string>('');

  public selectedToken: TokenAmount;

  constructor(
    public readonly swapFormService: SwapFormService,
    private readonly translateService: TranslateService,
    private readonly iframeService: IframeService,
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      const { fromAmount, fromAsset } = form;

      if (!fromAmount || fromAmount.isNaN()) {
        this.amount.setValue('');
      } else if (!fromAmount.eq(this.formattedAmount)) {
        this.amount.setValue(fromAmount.toFixed());
      }

      this.selectedToken = fromAsset as TokenAmount; // @todo update
      this.cdr.markForCheck();
    });
  }

  public ngAfterViewInit() {
    if (!this.iframeService.isIframe) {
      this.tokenAmountInput.nativeElement.focus();
    }
  }

  public onUserBalanceMaxButtonClick(): void {
    this.amount.setValue(this.selectedToken.amount.toFixed());
  }

  public onAmountChange(amount: string): void {
    this.amount.setValue(amount, { emitViewToModelChange: false });
    this.updateInputValue();
  }

  private updateInputValue(): void {
    const { fromAmount } = this.swapFormService.inputValue;
    if (
      ((fromAmount && !fromAmount.isNaN()) || this.formattedAmount) &&
      !fromAmount?.eq(this.formattedAmount)
    ) {
      this.swapFormService.inputControl.patchValue({
        fromAmount: new BigNumber(this.formattedAmount)
      });
    }
  }
}
