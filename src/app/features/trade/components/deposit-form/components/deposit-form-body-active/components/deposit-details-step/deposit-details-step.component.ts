import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { first, map, startWith, switchMap } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { getTokenAsset } from '../../../../utils/get-token-asset';

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

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly depositFormManager: DepositFormManager
  ) {}
}
