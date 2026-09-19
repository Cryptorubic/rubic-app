import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { first, map, share, switchMap } from 'rxjs';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';
import { ActionBtnState } from '../../../../models/step-types';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { getTokenAsset } from '../../../../utils/get-token-asset';

@Component({
  selector: 'app-deposit-trade-info-step',
  standalone: false,
  templateUrl: './deposit-trade-info-step.component.html',
  styleUrl: './deposit-trade-info-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepositTradeInfoStepComponent {
  public readonly step$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.TRADE_INFO]),
    share()
  );

  public readonly fromAsset$ = this.depositFormManager.depositFormSteps$.pipe(
    map(steps => steps[DEPOSIT_STEP_ORDER.EXCHANGE_DETAILS].depositDetails),
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

  public readonly depositTrade$ = this.depositFormManager.depositTrade$;

  constructor(
    private readonly depositFormManager: DepositFormManager,
    private readonly swapsFormService: SwapsFormService
  ) {}

  public confirmDeposit(): void {
    this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.TRADE_INFO, 'confirm_deposit');
  }

  public connectWalletAndSend(): void {
    this.depositFormManager.doAction(DEPOSIT_STEP_ORDER.TRADE_INFO, 'send_via_wallet');
  }

  public getActionBtnState(): ActionBtnState {
    return this.depositFormManager.getActionBtnState(
      DEPOSIT_STEP_ORDER.TRADE_INFO,
      'confirm_deposit'
    );
  }
}
