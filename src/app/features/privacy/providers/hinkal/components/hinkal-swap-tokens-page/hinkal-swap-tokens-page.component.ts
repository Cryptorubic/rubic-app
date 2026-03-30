import { ChangeDetectionStrategy, Component, Self } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PrivateSwapEvent } from '../../../shared-privacy-providers/models/private-event';
import { HinkalQuoteAdapter } from '../../services/hinkal-sdk/utils/hinkal-quote-adapter';
import {
  BlockchainsInfo,
  compareAddresses,
  EvmBlockchainName,
  Token,
  TokenAmount
} from '@cryptorubic/core';
import { HinkalFacadeService } from '../../services/hinkal-sdk/hinkal-facade.service';
import { firstValueFrom, map, startWith, takeUntil, tap } from 'rxjs';
import { HinkalPrivateAssetsService } from '../../services/hinkal-private-assets.service';
import { NotificationsService } from '@app/core/services/notifications/notifications.service';
import { TokensFacadeService } from '@app/core/services/tokens/tokens-facade.service';
import { HinkalSwapTokensFacadeService } from '../../services/hinkal-swap-tokens-facade.service';
import { HINKAL_WARNINGS } from '../../constants/hinkal-preswap-warnings';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PrivateActionButtonService } from '../../../shared-privacy-providers/services/private-action-button/private-action-button.service';
import { FromAssetsService } from '@app/features/trade/components/assets-selector/services/from-assets.service';
import { HinkalWorkerService } from '../../services/hinkal-sdk/hinkal-worker.service';
import { ToAssetsService } from '@app/features/trade/components/assets-selector/services/to-assets.service';
import { HINKAL_DEFAULT_CREATION_CONFIG } from '../../constants/hinkal-default-creation-config';
import { HinkalToPrivateAssetsService } from '../../services/hinkal-to-assets.service';
import { HinkalBalanceService } from '../../services/hinkal-sdk/hinkal-balance.service';
import { PrivateSwapWindowService } from '../../../shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-hinkal-swap-tokens-page',
  templateUrl: './hinkal-swap-tokens-page.component.html',
  styleUrls: ['./hinkal-swap-tokens-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TuiDestroyService,
    { provide: FromAssetsService, useClass: HinkalPrivateAssetsService },
    { provide: ToAssetsService, useClass: HinkalToPrivateAssetsService },
    { provide: TokensFacadeService, useClass: HinkalSwapTokensFacadeService }
  ]
})
export class HinkalSwapTokensPageComponent {
  public readonly receiverCtrl = new FormControl<string>('');

  public readonly creationConfig$ = this.hinkalFacadeService.activeChain$.pipe(
    map(chain => {
      return {
        ...HINKAL_DEFAULT_CREATION_CONFIG,
        assetsSelectorConfig: {
          ...HINKAL_DEFAULT_CREATION_CONFIG.assetsSelectorConfig,
          listType: chain,
          platformLoading$: this.hinkalFacadeService.balanceLoading$
        }
      };
    })
  );

  constructor(
    private readonly workerService: HinkalWorkerService,
    private readonly hinkalFacadeService: HinkalFacadeService,
    private readonly notificationsService: NotificationsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly privateActionButtonService: PrivateActionButtonService,
    private readonly hinkalBalanceService: HinkalBalanceService,
    private readonly privateSwapWindowService: PrivateSwapWindowService,
    private readonly fromAssetsService: FromAssetsService,
    private readonly toAssetsService: ToAssetsService
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

    this.fromAssetsService.assetListType$.pipe(takeUntil(this.destroy$)).subscribe(asset => {
      const isFromChain = BlockchainsInfo.isBlockchainName(asset);
      const isToChain = BlockchainsInfo.isBlockchainName(this.toAssetsService.assetListType);

      if (isFromChain && isToChain && asset !== this.toAssetsService.assetListType) {
        this.privateSwapWindowService.patchSwapInfo({ toAsset: null });
      }
    });

    this.toAssetsService.assetListType$.pipe(takeUntil(this.destroy$)).subscribe(asset => {
      const isToChain = BlockchainsInfo.isBlockchainName(asset);
      const isFromChain = BlockchainsInfo.isBlockchainName(this.fromAssetsService.assetListType);

      if (isFromChain && isToChain && asset !== this.fromAssetsService.assetListType) {
        this.privateSwapWindowService.patchSwapInfo({ fromAsset: null });
      }
    });
    this.subscribeOnPrivateBalanceChanges();
  }

  private subscribeOnPrivateBalanceChanges(): void {
    this.hinkalBalanceService.balances$
      .pipe(takeUntil(this.destroy$))
      .subscribe(shieldedBalances => {
        const swapInfo = this.privateSwapWindowService.swapInfo;

        if (swapInfo.fromAsset) {
          const balances = shieldedBalances[swapInfo.fromAsset.blockchain as EvmBlockchainName];
          const tokenBalance = balances?.find(balance =>
            compareAddresses(balance?.tokenAddress, swapInfo.fromAsset.address)
          );

          this.privateSwapWindowService.patchSwapInfo({
            fromAsset: {
              ...swapInfo.fromAsset,
              amount: tokenBalance
                ? Token.fromWei(tokenBalance.amount, swapInfo.fromAsset.decimals)
                : new BigNumber(0)
            }
          });
        }
      });
  }

  public readonly quoteAdapter = new HinkalQuoteAdapter(
    this.workerService,
    this.notificationsService
  );

  public async handleSwap({
    swapInfo,
    loadingCallback,
    openPreview
  }: PrivateSwapEvent): Promise<void> {
    try {
      const fromToken = new TokenAmount({
        ...swapInfo.fromAsset,
        weiAmount: Token.toWei(swapInfo.fromAmount.actualValue, swapInfo.fromAsset.decimals)
      });

      const toToken = new TokenAmount({
        ...swapInfo.toAsset,
        weiAmount: Token.toWei(swapInfo.toAmount.actualValue, swapInfo.toAsset.decimals)
      });

      const steps = this.hinkalFacadeService.prepareSwapSteps(
        fromToken as TokenAmount<EvmBlockchainName>,
        toToken as TokenAmount<EvmBlockchainName>
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
}
