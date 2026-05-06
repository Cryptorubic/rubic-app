import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { compareAddresses, EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { filter, firstValueFrom, map, startWith, tap } from 'rxjs';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalBalanceService } from '../../services/hinkal-sdk/hinkal-balance.service';
import { RevealWindowService } from '../../../shared-privacy-providers/services/reveal-window/reveal-window.service';
import BigNumber from 'bignumber.js';
import { HinkalRevealFacadeService } from '../../services/token-facades/hinkal-reveal-facade.service';

@Component({
  selector: 'app-hinkal-reveal-tokens-page',
  templateUrl: './hinkal-reveal-tokens-page.component.html',
  styleUrls: ['./hinkal-reveal-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ],
  standalone: false
})
export class HinkalRevealTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        withReceiver: true,
        receiverPlaceholder: 'Enter receiver’s EVM wallet address',
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
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly revealWindowService: RevealWindowService
  ) {}

  ngOnInit(): void {
    this.receiverCtrl.valueChanges
      .pipe(
        startWith(this.receiverCtrl.value),
        tap(address => {
          this.privateActionButtonService.setReceiverAddress(address);
        }),
        takeUntilDestroyed(this.destroyRef)
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
        takeUntilDestroyed(this.destroyRef)
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

  public async reveal({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = this.hinkalFacadeService.prepareWithdrawSteps(
        token as TokenAmount<EvmBlockchainName>,
        this.receiverCtrl.value
      );

      const preview$ = openPreview({
        steps,
        warnings: HINKAL_WARNINGS
      });
      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }

  readonly destroyRef = inject(DestroyRef);
}
