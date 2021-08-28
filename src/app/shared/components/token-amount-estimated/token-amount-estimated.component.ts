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
import { CryptoTapFormOutput } from 'src/app/features/crypto-tap/models/CryptoTapForm';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Component({
  selector: 'app-amount-estimated',
  templateUrl: './token-amount-estimated.component.html',
  styleUrls: ['./token-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountEstimatedComponent implements OnInit, OnDestroy {
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

  public usd: string;

  public tokensAmount: string;

  public blockchain: BLOCKCHAIN_NAME;

  public fee: {
    token: TokenAmount;
    amount: BigNumber;
  };

  public formSubscription$: Subscription;

  public hidden: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.formSubscription$ = this.formService.outputValueChanges.subscribe(form => {
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
      this.usd = toToken?.price && toAmount.multipliedBy(toToken.price).toFixed(2);

      this.fee = (form as CryptoTapFormOutput).fee;

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
  }
}
