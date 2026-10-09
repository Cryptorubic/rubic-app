import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { combineLatest, first, map, startWith, switchMap } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { DepositFormManager } from '../../../../services/injectable/deposit-form-manager';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { getTokenAsset } from '../../../../utils/get-token-asset';
import { DEPOSIT_FORM_STATE } from '../../../../models/deposit-form-states';

@Component({
  selector: 'app-deposit-details-step',
  standalone: false,
  templateUrl: './deposit-details-step.component.html',
  styleUrl: './deposit-details-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositDetailsStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS])
  );

  public readonly isStepHighlighted$ = this.depositFormManager.depositFormState$.pipe(
    map(state => state === DEPOSIT_FORM_STATE.IDLE)
  );

  public readonly details$ = this.step$.pipe(
    map(detailsStep => detailsStep.depositDetails),
    startWith(null)
  );

  public readonly fromAsset$ = this.details$.pipe(
    switchMap(details =>
      this.swapsFormService.fromToken$.pipe(
        first(),
        map(
          fromToken =>
            ({
              ...fromToken,
              amount: details?.srcToken.tokenAmount ?? fromToken.amount
            }) as BalanceToken
        )
      )
    ),
    map(balanceToken => getTokenAsset(balanceToken))
  );

  public readonly toAsset$ = this.details$.pipe(
    switchMap(details =>
      this.swapsFormService.toToken$.pipe(
        first(),
        map(
          toToken =>
            ({
              ...toToken,
              amount: details?.dstToken.tokenAmount ?? toToken.amount
            }) as BalanceToken
        )
      )
    ),
    map(balanceToken => getTokenAsset(balanceToken))
  );

  public readonly viaWalletBtnState$ = combineLatest([
    this.step$,
    this.depositFormManager.depositFormState$
  ]).pipe(
    map(() =>
      this.depositFormManager.getActionBtnState(
        DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS,
        'select_via_wallet'
      )
    )
  );

  public readonly manualBtnState$ = combineLatest([
    this.step$,
    this.depositFormManager.depositFormState$
  ]).pipe(
    map(() =>
      this.depositFormManager.getActionBtnState(
        DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS,
        'select_manual_flow'
      )
    )
  );

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly depositFormManager: DepositFormManager
  ) {}

  public selectViaWalletFlow(): void {
    this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS, 'select_via_wallet');
  }

  public selectManualFlow(): void {
    this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS, 'select_manual_flow');
  }
}
