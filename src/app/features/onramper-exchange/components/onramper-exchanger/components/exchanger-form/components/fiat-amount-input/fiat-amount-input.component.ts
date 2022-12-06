import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import BigNumber from 'bignumber.js';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TranslateService } from '@ngx-translate/core';
import { ExchangerFormService } from '@features/onramper-exchange/services/exchanger-form-service/exchanger-form.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-fiat-amount-input',
  templateUrl: './fiat-amount-input.component.html',
  styleUrls: ['./fiat-amount-input.component.scss'],
  providers: [TuiDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FiatAmountInputComponent implements OnInit {
  @ViewChild('tokenAmount') public readonly tokenAmountInput: ElementRef<HTMLInputElement>;

  public readonly placeholder$ = this.translateService.get('errors.noEnteredAmount');

  private get formattedAmount(): string {
    return this.amount?.value.split(',').join('');
  }

  public amount = new FormControl<string>('');

  constructor(
    private readonly exchangerFormService: ExchangerFormService,
    private readonly translateService: TranslateService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.exchangerFormService.input$.subscribe(input => {
      const { fromAmount } = input;

      if (!fromAmount || fromAmount.isNaN()) {
        this.amount.setValue('');
      } else if (!fromAmount.eq(this.formattedAmount)) {
        this.amount.setValue(fromAmount.toFixed());
      }
      this.cdr.markForCheck();
    });
  }

  public onAmountChange(amount: string): void {
    this.amount.setValue(amount, { emitViewToModelChange: false });
    this.updateInputValue();
  }

  private updateInputValue(): void {
    const { fromAmount } = this.exchangerFormService.input.value;
    if (
      ((fromAmount && !fromAmount.isNaN()) || this.formattedAmount) &&
      !fromAmount?.eq(this.formattedAmount)
    ) {
      this.exchangerFormService.input.patchValue({
        fromAmount: new BigNumber(this.formattedAmount)
      });
    }
  }
}
