import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Input
} from '@angular/core';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { Subscription } from 'rxjs';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-crypto-tap-top-form',
  templateUrl: './crypto-tap-top-form.component.html',
  styleUrls: ['./crypto-tap-top-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoTapTopFormComponent implements OnInit, OnDestroy {
  @Input() loading: boolean;

  @Input() tokens;

  @Input() tokensLoading;

  public token: TokenAmount;

  public amount: BigNumber;

  public $fromAmountSubscription: Subscription;

  public $fromTokenSubscription: Subscription;

  constructor(private cdr: ChangeDetectorRef, public cryptoTapFormService: CryptoTapFormService) {}

  ngOnInit(): void {
    this.token = this.cryptoTapFormService.commonTrade.controls.input.value.fromToken;
    this.amount = this.cryptoTapFormService.commonTrade.controls.output.value.fromAmount;

    this.$fromAmountSubscription =
      this.cryptoTapFormService.commonTrade.controls.output.valueChanges.subscribe(value => {
        this.amount = value.fromAmount;
        this.cdr.detectChanges();
      });

    this.$fromTokenSubscription =
      this.cryptoTapFormService.commonTrade.controls.input.valueChanges.subscribe(value => {
        this.token = value.fromToken;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.$fromTokenSubscription.unsubscribe();
    this.$fromAmountSubscription.unsubscribe();
  }

  public getUsdPrice(): BigNumber {
    return this.amount?.multipliedBy(this.token?.price ?? 0);
  }
}
