import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { compareAddresses, EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { filter, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalBalanceService } from '../../services/hinkal-sdk/hinkal-balance.service';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import BigNumber from 'bignumber.js';
import { HinkalRevealFacadeService } from '../../services/token-facades/hinkal-reveal-facade.service';
import { PrivateGasTokenService } from '../../../shared-privacy-providers/services/gas-token-service/gas-token.service';
import { HINKAL_PRIVATE_OPERATION } from '../../constants/hinkal-private-operations';

@Component({
  selector: 'app-hinkal-reveal-tokens-page',
  templateUrl: './hinkal-reveal-tokens-page.component.html',
  styleUrls: ['./hinkal-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ]
})
export class HinkalRevealTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        withReceiver: true,
        receiverPlaceholder: 'Enter receiver’s EVM wallet address',
        showPresets: true,
        showWarnings: true,
        assetsSelectorConfig: {
          ...HINKAL_DEFAULT_CREATION_CONFIG.assetsSelectorConfig,
          listType: chain,
          platformLoading$: this.hinkalFacadeService.balanceLoading$
        }
      };
    })
  );

  constructor(
    private readonly hinkalFacadeService: HinkalFacadeService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly revealWindowService: RevealWindowService,
    private readonly gasTokenService: PrivateGasTokenService
  ) {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.hinkalBalanceService.balances$
      .pipe(
        filter(() => !!this.revealWindowService.revealAsset?.address),
        map(shieldBalances => {
          const balances =
            shieldBalances[this.revealWindowService.revealAsset?.blockchain as EvmBlockchainName];

          return (
            balances &&
            balances.find(balance =>
              compareAddresses(balance.tokenAddress, this.revealWindowService.revealAsset.address)
            )
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(shieldBalance => {
        const revealAsset = this.revealWindowService.revealAsset;

        this.revealWindowService.setRevealAsset({
          ...revealAsset,
          amount: shieldBalance
            ? Token.fromWei(shieldBalance.amount, revealAsset.decimals)
            : new BigNumber(0)
        });
      });
  }

  public async handleMaxButton(): Promise<void> {
    const token = this.revealWindowService.revealAsset;
    const estimatedFees = this.hinkalFacadeService.getEstimatedFeesByChain(token.blockchain);

    const privateBalances = await firstValueFrom(this.hinkalBalanceService.balances$);

    const balances = privateBalances[token.blockchain as EvmBlockchainName];

    const tokenWithEnoughBalance = balances.find(tokenBalance => {
      const estimatedFee = estimatedFees
        .filter(t => !compareAddresses(t.feeToken, token.address))
        .find(({ feeToken }) => compareAddresses(feeToken, tokenBalance.tokenAddress));

      if (!estimatedFee) return false;

      return new BigNumber(tokenBalance.amount).minus(estimatedFee.flatFee.toString()).gte(0);
    });

    if (tokenWithEnoughBalance) {
      this.gasTokenService.selectGasToken(tokenWithEnoughBalance.tokenAddress);

      this.revealWindowService.setRevealAmount({
        visibleValue: token.amount.toFixed(),
        actualValue: token.amount
      });

      return;
    }

    const tokenFee =
      estimatedFees
        .find(({ feeToken }) => compareAddresses(feeToken, token.address))
        ?.flatFee?.toString() || new BigNumber(0);

    const maxAmountWithoutFee = token.amount.minus(Token.fromWei(tokenFee, token.decimals));

    const finalMaxAmount = maxAmountWithoutFee.lte(0) ? token.amount : maxAmountWithoutFee;

    this.gasTokenService.selectGasToken(token.address);

    this.revealWindowService.setRevealAmount({
      visibleValue: finalMaxAmount.toFixed(),
      actualValue: finalMaxAmount
    });
  }

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const fromToken = token as TokenAmount<EvmBlockchainName>;

      const gasTokens = await this.hinkalFacadeService.prepareGasTokens(
        fromToken,
        HINKAL_PRIVATE_OPERATION.UNSHIELD
      );

      const steps = this.hinkalFacadeService.prepareWithdrawSteps(
        fromToken,
        () => this.gasTokenService.selectedGasToken,
        this.receiverCtrl.value
      );

      const preview$ = openPreview({
        steps,
        warnings: HINKAL_WARNINGS,
        gasTokens,
        swapType: 'transfer'
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
