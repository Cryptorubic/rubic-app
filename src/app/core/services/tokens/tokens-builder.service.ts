import { inject, Injectable } from '@angular/core';
import { AssetListType, UtilityAssetType } from '@features/trade/models/asset';
import { BlockchainTokenState } from '@core/services/tokens/models/new-token-types';
import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';
import { BlockchainsInfo } from '@cryptorubic/core';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { Observable } from 'rxjs';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { map, tap } from 'rxjs/operators';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { compareTokens } from '@shared/utils/utils';
import BigNumber from 'bignumber.js';
import {
  sorterByBalance,
  sorterByChain
} from '@features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { TokensBalanceService } from '@app/core/services/tokens/tokens-balance.service';
import { distinctObjectUntilChanged } from '@app/shared/utils/distinct-object-until-changed';

@Injectable({
  providedIn: 'root'
})
export class TokensBuilderService {
  private readonly tokensCollectionsFacade = inject(TokensCollectionsFacadeService);

  private readonly balanceService = inject(TokensBalanceService);

  public getTokensBasedOnType(type: AssetListType): BlockchainTokenState | CommonUtilityStore {
    if (BlockchainsInfo.isBlockchainName(type)) {
      return this.tokensCollectionsFacade.blockchainTokens[type];
    }

    const utilityMap: Record<UtilityAssetType, CommonUtilityStore> = {
      allChains: this.tokensCollectionsFacade.allTokens,
      trending: this.tokensCollectionsFacade.trending,
      gainers: this.tokensCollectionsFacade.gainers,
      losers: this.tokensCollectionsFacade.losers,
      favorite: this.tokensCollectionsFacade.favorite
    };

    const store = utilityMap[type];

    return store;
  }

  public getTokensList(
    type: AssetListType,
    query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.getTokensBasedOnType(type).tokens$.pipe(
      distinctObjectUntilChanged(),
      tap((tokens: BalanceToken[]) => {
        if (query) this.balanceService.fetchDifferentChainsBalances(tokens, false);
      }),
      map((tokens: BalanceToken[]) => {
        const mappedTokens = tokens.map(token => {
          const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
          const isAvailable = oppositeToken ? !compareTokens(token, oppositeToken) : true;
          return {
            ...token,
            available: isAvailable,
            amount: token?.amount?.gt(0) ? token.amount : new BigNumber(NaN)
          };
        });

        const sortedByOpposite = mappedTokens.sort((a, b) => {
          const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
          if (oppositeToken) {
            if (a.address === oppositeToken.address && a.blockchain === oppositeToken.blockchain) {
              return 1;
            }
            if (b.address === oppositeToken.address && b.blockchain === oppositeToken.blockchain) {
              return -1;
            }
          }

          return 0;
        });
        if (BlockchainsInfo.isBlockchainName(type)) {
          return sortedByOpposite.sort(sorterByChain);
        }
        if (type === 'allChains') {
          return sortedByOpposite.sort(sorterByBalance);
        }
        return sortedByOpposite;
      })
    );
  }
}
