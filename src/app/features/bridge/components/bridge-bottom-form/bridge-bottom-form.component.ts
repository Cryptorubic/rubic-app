import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subscription } from 'rxjs';
import BigNumber from 'bignumber.js';
import { BridgeService } from '../../services/bridge-service/bridge.service';
import { ErrorsService } from '../../../../core/errors/errors.service';
import { RubicError } from '../../../../shared/models/errors/RubicError';
import { SwapFormService } from '../../../swaps/services/swaps-form-service/swap-form.service';

@Component({
  selector: 'app-bridge-bottom-form',
  templateUrl: './bridge-bottom-form.component.html',
  styleUrls: ['./bridge-bottom-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BridgeBottomFormComponent implements OnInit, OnDestroy {
  private formSubscription$: Subscription;

  public loading: boolean;

  public get allowSwap(): boolean {
    return true;
  }

  constructor(
    private bridgeService: BridgeService,
    private errorsService: ErrorsService,
    private swapFormService: SwapFormService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading = false;
  }

  ngOnInit() {
    this.swapFormService.commonTrade.controls.input.valueChanges.subscribe(() =>
      this.calculateTrade()
    );
  }

  ngOnDestroy() {
    this.formSubscription$.unsubscribe();
  }

  public calculateTrade() {
    const { fromBlockchain, toBlockchain, fromToken, toToken, fromAmount } =
      this.swapFormService.commonTrade.controls.input.value;
    if (
      !fromBlockchain ||
      !toBlockchain ||
      !fromToken ||
      !toToken ||
      !fromAmount ||
      fromAmount.eq(0) ||
      fromAmount.isNaN()
    ) {
      this.swapFormService.commonTrade.controls.output.patchValue({
        toAmount: new BigNumber(NaN)
      });
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    this.bridgeService.getFee().subscribe(fee => {
      if (fee === null) {
        this.errorsService.catch$(new RubicError());
        return;
      }

      this.swapFormService.commonTrade.controls.output.patchValue({
        toAmount: fromAmount.minus(fee)
      });
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}
