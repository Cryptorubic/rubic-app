import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { PrivateEvent } from '../../../shared-privacy-providers/models/private-event';

import { compareAddresses, EvmBlockchainName, Token, TokenAmount } from '@cryptorubic/core';
import { filter, firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalRevealFacadeService } from '../../services/hinkal-reveal-facade.service';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HinkalBalanceService } from '../../services/hinkal-sdk/hinkal-balance.service';
import { PrivateTransferWindowService } from '../../../shared-privacy-providers/services/private-transfer-window/private-transfer-window.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-hinkal-transfer-tokens-page',
  templateUrl: './hinkal-transfer-tokens-page.component.html',
  styleUrls: ['./hinkal-transfer-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: ToAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalRevealFacadeService }
  ]
})
export class HinkalTransferTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        withReceiver: true,
        receiverPlaceholder: 'Enter receiver’s stealth address ',
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
    private readonly transferWindowService: PrivateTransferWindowService
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
        filter(() => !!this.transferWindowService.transferAsset?.address),
        map(shieldBalances => {
          const balances =
            shieldBalances[
              this.transferWindowService.transferAsset.blockchain as EvmBlockchainName
            ];

          return (
            balances &&
            balances.find(balance =>
              compareAddresses(
                balance.tokenAddress,
                this.transferWindowService.transferAsset.address
              )
            )
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(shieldBalance => {
        const transferAsset = this.transferWindowService.transferAsset;

        this.transferWindowService.setTransferAsset({
          ...transferAsset,
          amount: shieldBalance
            ? Token.fromWei(shieldBalance.amount, transferAsset.decimals)
            : new BigNumber(0)
        });
      });
  }

  public async transfer({ token, loadingCallback, openPreview }: PrivateEvent): Promise<void> {
    try {
      const steps = this.hinkalFacadeService.prepareTransferSteps(
        token as TokenAmount<EvmBlockchainName>,
        this.receiverCtrl.value
      );
      const preview$ = openPreview({
        steps,
        warnings: HINKAL_WARNINGS,
        dstTokenAmount: token.tokenAmount.multipliedBy(1 - 0.0005).toFixed()
      });

      await firstValueFrom(preview$);
    } finally {
      loadingCallback();
    }
  }
}
