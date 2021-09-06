import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { CryptoTapFormService } from 'src/app/features/crypto-tap/services/crypto-tap-form-service/crypto-tap-form.service';
import { Subscription } from 'rxjs';
import { CryptoTapTokensService } from 'src/app/features/crypto-tap/services/crypto-tap-tokens-service/crypto-tap-tokens.service';
import { CryptoTapService } from 'src/app/features/crypto-tap/services/crypto-tap-service/crypto-tap.service';
import BigNumber from 'bignumber.js';
import { CryptoTapFullPriceFeeInfo } from 'src/app/features/crypto-tap/models/CryptoTapFullPriceFeeInfo';

@Component({
  selector: 'app-crypto-tap-discount',
  templateUrl: './crypto-tap-discount.component.html',
  styleUrls: ['./crypto-tap-discount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CryptoTapDiscountComponent implements OnInit, OnDestroy {
  public $formSubscription: Subscription;

  public bestRate: boolean;

  public discount: string;

  constructor(
    private cryptoTapService: CryptoTapService,
    private cryptoTapFormService: CryptoTapFormService,
    private cryptoTapTokensService: CryptoTapTokensService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const { toBlockchain, fromToken } = this.cryptoTapFormService.commonTrade.controls.input.value;

    const ETH = this.cryptoTapTokensService.availableTokens.from.find(
      token => token.symbol === 'ETH'
    );

    this.bestRate = fromToken.symbol === 'RBC';

    if (this.bestRate) {
      const { token: feeToken, amount: feeAmount } =
        this.cryptoTapFormService.commonTrade.controls.output.value.fee;

      this.cryptoTapService.fullPriceFeeInfo$.subscribe(fullPriceFeeInfo => {
        if (fullPriceFeeInfo) {
          const fullPriceUsdFee = fullPriceFeeInfo[
            toBlockchain as keyof CryptoTapFullPriceFeeInfo
          ].multipliedBy(ETH.price);
          const currentUsdFee = feeAmount.multipliedBy(feeToken.price);
          const discount = new BigNumber(1).minus(currentUsdFee.div(fullPriceUsdFee));
          this.discount = discount.multipliedBy(100).toFixed(0);
          this.cdr.detectChanges();
        }
      });
    }

    this.$formSubscription = this.cryptoTapFormService.commonTrade.valueChanges.subscribe(form => {
      if (form.input.fromToken?.symbol === 'RBC') {
        this.bestRate = true;
        return;
      }
      this.bestRate = false;
    });
  }

  ngOnDestroy(): void {
    this.$formSubscription.unsubscribe();
  }

  public onSwitchClick() {
    const RBC = this.cryptoTapTokensService.availableTokens.from.find(
      token => token.symbol === 'RBC'
    );
    this.cryptoTapFormService.commonTrade.controls.input.patchValue({
      fromToken: RBC
    });
  }
}
