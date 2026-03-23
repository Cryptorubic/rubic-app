import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivateSwapInfo, SwapAmount } from '../../models/swap-info';
import { QueryParams } from '@app/core/services/query-params/models/query-params';
import { firstValueFrom, forkJoin, map, of, switchMap } from 'rxjs';
import { PrivateSwapWindowService } from '../private-swap-window/private-swap-window.service';
import { SwapFormQueryService } from '@app/features/trade/services/swap-form-query/swap-form-query.service';
import { List } from 'immutable';
import { BlockchainName } from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { compareTokens } from '@app/shared/utils/utils';
import { BalanceToken } from '@app/shared/models/tokens/balance-token';

@Injectable()
export class PrivateQueryParamsService {
  private readonly privateSwapWindowService = inject(PrivateSwapWindowService);

  private readonly swapFormQueryService = inject(SwapFormQueryService);

  private readonly router = inject(Router);

  private readonly activatedRoute = inject(ActivatedRoute);

  /**
   * @param tokensFacade tokensFacade.tokens used to find tokens:
   * 1) when form selector makes swap from private balance - pass here private tokens
   * 2) when form selector makes swap from public balance - pass here public tokens
   * @param applySwapInfo callback to put swapInfo in form
   */
  public parseMainSwapInfoAndQueryParams(
    supportedTokens: List<BalanceToken>,
    applySwapInfo: (swapInfo: PrivateSwapInfo) => void
  ): void {
    forkJoin([
      firstValueFrom(this.privateSwapWindowService.swapInfo$),
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
          const fromAmount: SwapAmount = !isNaN(Number(queryParams.amount))
            ? {
                actualValue: new BigNumber(queryParams.amount),
                visibleValue: queryParams.amount
              }
            : null;
          const toAmount: SwapAmount | null = null;

          return forkJoin([
            fromToken$.pipe(
              map(fromToken => supportedTokens.find(t => compareTokens(fromToken, t))),
              map(fromToken => (fromToken.address ? fromToken : null))
            ),
            toToken$.pipe(
              map(toToken => supportedTokens.find(t => compareTokens(toToken, t))),
              map(toToken => (toToken.address ? toToken : null))
            ),
            of(fromAmount),
            of(toAmount)
          ]);
        })
      )
      .subscribe(([fromAsset, toAsset, fromAmount, toAmount]) => {
        const swapInfo: PrivateSwapInfo = { fromAsset, toAsset, fromAmount, toAmount };
        this.privateSwapWindowService.patchSwapInfo(swapInfo);
        applySwapInfo(swapInfo);
      });
  }

  public setQueryParams(partialSwapInfo: Partial<PrivateSwapInfo>): void {
    const queryParams = this.convertSwapInfoToQueryParams(partialSwapInfo);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  private convertSwapInfoToQueryParams(
    partialSwapInfo: Partial<PrivateSwapInfo>
  ): Partial<QueryParams> {
    const queryParams: QueryParams = {};
    if (partialSwapInfo.fromAmount) {
      queryParams.amount = partialSwapInfo.fromAmount.actualValue.toFixed();
    }
    if (partialSwapInfo.fromAsset) {
      queryParams.from = partialSwapInfo.fromAsset.symbol;
      queryParams.fromChain = partialSwapInfo.fromAsset.blockchain;
    }
    if (partialSwapInfo.toAsset) {
      queryParams.to = partialSwapInfo.toAsset.symbol;
      queryParams.toChain = partialSwapInfo.toAsset.blockchain;
    }

    return queryParams;
  }
}
