import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivateSwapInfo, SwapAmount } from '../../models/swap-info';
import { QueryParams } from '@app/core/services/query-params/models/query-params';
import { firstValueFrom, forkJoin, map, of, switchMap } from 'rxjs';
import { SwapFormQueryService } from '@app/features/trade/services/swap-form-query/swap-form-query.service';
import { List } from 'immutable';
import { BLOCKCHAIN_NAME, BlockchainName } from '@cryptorubic/core';
import { compareTokens } from '@app/shared/utils/utils';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';
import { HideWindowService } from '../hide-window-service/hide-window.service';
import { RevealWindowService } from '../reveal-window/reveal-window.service';
import { PrivateTransferWindowService } from '../private-transfer-window/private-transfer-window.service';
import { PrivacyMainPageService } from '@app/features/privacy/services/privacy-main-page.service';
import { PrivacyFormValue } from '@app/features/privacy/services/models/privacy-form';
import { PrivateSwapWindowService } from '../private-swap-window/private-swap-window.service';
import { Web3Pure } from '@cryptorubic/web3';

@Injectable()
export class PrivateQueryParamsService {
  private readonly hideTokensWindowService = inject(HideWindowService);

  private readonly revealTokensWindowService = inject(RevealWindowService);

  private readonly privateTransferWindowService = inject(PrivateTransferWindowService);

  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  private readonly privacyMainPageService = inject(PrivacyMainPageService);

  private readonly swapFormQueryService = inject(SwapFormQueryService);

  private readonly router = inject(Router);

  private readonly activatedRoute = inject(ActivatedRoute);

  public parseMainSwapInfoAndQueryParams(supportedTokens: List<BalanceToken>): void {
    forkJoin([
      firstValueFrom(this.privacyMainPageService.swapInfo$),
      firstValueFrom(this.activatedRoute.queryParams)
    ])
      .pipe(
        switchMap(([swapInfo, queryParams]: [PrivateSwapInfo, QueryParams]) => {
          const fromToken$ = swapInfo.fromAsset
            ? of(swapInfo.fromAsset)
            : this.swapFormQueryService.getTokenBySymbolOrAddress(
                supportedTokens,
                queryParams.from,
                queryParams.fromChain as BlockchainName,
                true
              );
          const toToken$ = swapInfo.toAsset
            ? of(swapInfo.toAsset)
            : this.swapFormQueryService.getTokenBySymbolOrAddress(
                supportedTokens,
                queryParams.to,
                queryParams.toChain,
                true
              );
          const fromAmount: SwapAmount | null = null;
          const toAmount: SwapAmount | null = null;

          return forkJoin([
            fromToken$.pipe(
              map(fromToken =>
                supportedTokens.find(t => compareTokens(fromToken, t)) ? fromToken : null
              ),
              map(fromToken => (fromToken?.address ? fromToken : null))
            ),
            toToken$.pipe(
              map(toToken =>
                supportedTokens.find(t => compareTokens(toToken, t)) ? toToken : null
              ),
              map(toToken => (toToken?.address ? toToken : null))
            ),
            of(fromAmount),
            of(toAmount)
          ]);
        }),
        switchMap(([fromAsset, toAsset, fromAmount, toAmount]) => {
          if (toAsset && !fromAsset) {
            toAsset = null;
          }
          const swapInfo: PrivateSwapInfo = { fromAsset, toAsset, fromAmount, toAmount };

          this.hideTokensWindowService.setHideAsset(swapInfo.fromAsset);
          this.hideTokensWindowService.setHideAmount(swapInfo.fromAmount);

          this.revealTokensWindowService.setRevealAsset(swapInfo.fromAsset);
          this.revealTokensWindowService.setRevealAmount(swapInfo.fromAmount);

          this.privateTransferWindowService.setTransferAsset(swapInfo.fromAsset);
          this.privateTransferWindowService.setTransferAmount(swapInfo.fromAmount);

          this.privateSwapWindowService.patchSwapInfo(swapInfo);

          if (!swapInfo.fromAsset && !swapInfo.toAsset) {
            fromAsset =
              supportedTokens.find(
                token =>
                  token.blockchain === BLOCKCHAIN_NAME.ETHEREUM &&
                  Web3Pure.isNativeAddress(BLOCKCHAIN_NAME.ETHEREUM, token.address)
              ) || null;
            this.privacyMainPageService.patchFormValue({ fromAsset });
          } else {
            this.privacyMainPageService.patchFormValue(swapInfo);
            return of(null);
          }
        })
      )
      .subscribe();
  }

  public setQueryParams(swapInfo: PrivacyFormValue): void {
    const queryParams = this.convertSwapInfoToQueryParams(swapInfo);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams
    });
  }

  private convertSwapInfoToQueryParams(swapInfo: PrivacyFormValue): Partial<QueryParams> {
    const queryParams: QueryParams = {};
    if (swapInfo.fromAsset) {
      queryParams.from = swapInfo.fromAsset.symbol;
      queryParams.fromChain = swapInfo.fromAsset.blockchain;
    }
    if (swapInfo.toAsset) {
      queryParams.to = swapInfo.toAsset.symbol;
      queryParams.toChain = swapInfo.toAsset.blockchain;
    }

    return queryParams;
  }
}
