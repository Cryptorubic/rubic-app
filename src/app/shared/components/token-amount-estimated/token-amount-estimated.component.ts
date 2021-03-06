import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import { FormService } from 'src/app/shared/models/swaps/FormService';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-amount-estimated',
  templateUrl: './token-amount-estimated.component.html',
  styleUrls: ['./token-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountEstimatedComponent implements OnInit, OnDestroy {
  @Input() set loading(value: boolean) {
    this._loading = value;
    this.hidden = false;
  }

  @Input() disabled: boolean;

  @Input() formService: FormService;

  public _loading: boolean;

  public usd: string;

  public tokensAmount: string;

  public fee: {
    token: TokenAmount;
    amount: BigNumber;
  };

  public formSubscription$: Subscription;

  public hidden: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.formSubscription$ = this.formService.commonTrade.controls.output.valueChanges.subscribe(
      output => {
        if (output.toAmount.isNaN()) {
          this.hidden = true;
          this.cdr.detectChanges();
          return;
        }
        this.hidden = false;
        const { toToken } = this.formService.commonTrade.controls.input.value;
        this.tokensAmount = output.toAmount.toFixed();
        this.usd = toToken?.price && output.toAmount.multipliedBy(toToken.price).toFixed(2);
        // @ts-ignore
        this.fee = output.fee;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
  }
}
