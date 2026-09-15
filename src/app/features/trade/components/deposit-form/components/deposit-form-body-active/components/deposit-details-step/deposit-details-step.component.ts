import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapsFormService } from '@app/features/trade/services/swaps-form/swaps-form.service';
import { first, map, startWith, switchMap } from 'rxjs';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { AssetSelector } from '@app/shared/models/asset-selector';
import { BLOCKCHAINS } from '@app/shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@app/shared/constants/blockchain/blockchain-color';
import { DepositFormManager } from '../../../../services/deposit-form-manager';
import { DEPOSIT_STEP_ORDER } from '../../../../models/deposit-step-order';

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
    map(balanceToken => this.getTokenAsset(balanceToken))
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
    map(balanceToken => this.getTokenAsset(balanceToken))
  );

  constructor(
    private readonly swapsFormService: SwapsFormService,
    private readonly depositFormManager: DepositFormManager
  ) {}

  private getTokenAsset(token: BalanceToken): Required<AssetSelector> {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }
}
