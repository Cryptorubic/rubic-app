import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SwapFormService } from '../../../features/swaps/services/swaps-form-service/swap-form.service';

@Component({
  selector: 'app-amount-input',
  templateUrl: './token-amount-estimated.component.html',
  styleUrls: ['./token-amount-estimated.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmountInputComponent implements OnInit, OnDestroy {
  @Input() public loading: boolean;

  @Input() public disabled: boolean;

  public usd: string;

  public tokensAmount: string;

  public formSubscription$: Subscription;

  constructor(private swapFormService: SwapFormService) {}

  ngOnInit() {
    this.swapFormService.commonTrade.controls.output.valueChanges.subscribe(value => {
      this.tokensAmount = value.toAmount.toFixed();
      this.usd = value.toToken.price && value.toAmount.multipliedBy(value.toToken.price).toFixed(2);
    });
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
  }
}
