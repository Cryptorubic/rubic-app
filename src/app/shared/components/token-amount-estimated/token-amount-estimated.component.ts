import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-amount-estimated',
  templateUrl: './token-amount-estimated.component.html',
  styleUrls: ['./token-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AmountEstimatedComponent implements OnInit {
  @Input() set loading(value: boolean) {
    this._loading = value;
    if (value) {
      this.hidden = false;
    }
  }

  get loading(): boolean {
    return this._loading;
  }

  @Input() disabled: boolean;

  @Input() formService: FormService;

  @Input() errorText = '';

  private _loading: boolean;

  public usd: BigNumber;

  public tokensAmount: string;

  public blockchain: BLOCKCHAIN_NAME;

  public fee: {
    token: TokenAmount;
    amount: BigNumber;
  };

  public hidden: boolean;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly destroy$: TuiDestroyService
  ) {}

  ngOnInit() {
    this.formService.outputValueChanges.pipe(takeUntil(this.destroy$)).subscribe(form => {
      if (!form.toAmount || form.toAmount.isNaN()) {
        this.hidden = true;
        this.tokensAmount = null;
        this.usd = null;
        this.cdr.detectChanges();
        return;
      }

      this.hidden = false;

      const { toToken } = this.formService.inputValue;
      this.blockchain = this.formService.inputValue.toBlockchain;
      const toAmount = form.toAmount.lte(0) ? new BigNumber(0) : form.toAmount;
      this.tokensAmount = toAmount.toFixed();
      this.usd = toToken?.price ? toAmount.multipliedBy(toToken.price) : new BigNumber(NaN);

      this.cdr.detectChanges();
    });

    this.formService.input.controls.toToken.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(toToken => {
        if (this.tokensAmount) {
          this.usd = toToken?.price
            ? new BigNumber(this.tokensAmount).multipliedBy(toToken.price)
            : new BigNumber(NaN);
          this.cdr.detectChanges();
        }
      });
  }
}
