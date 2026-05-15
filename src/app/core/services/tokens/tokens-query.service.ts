import { BehaviorSubject } from 'rxjs';
import { AssetListType, UtilityAssetType } from '@features/trade/models/asset';
import { debounceTime } from 'rxjs/operators';
import { BlockchainsInfo } from '@cryptorubic/core';
import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';
import { inject, Injectable } from '@angular/core';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';

@Injectable({
  providedIn: 'root'
})
export class TokensQueryService {
  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly tokensCollections = inject(TokensCollectionsFacadeService);

  private readonly _tokenQuery$ = new BehaviorSubject<{
    listType: AssetListType;
    query: string;
  } | null>(null);

  public readonly tokenQuery$ = this._tokenQuery$.asObservable().pipe(debounceTime(10));

  public buildSearchedList(query: string, assetListType: AssetListType): void {
    this._tokenQuery$.next({ listType: assetListType, query });
  }

  public subscribeOnQuery(): void {
    this.tokenQuery$.subscribe(object => {
      if (!object) {
        return;
      }
      const { listType, query } = object;
      if (BlockchainsInfo.isBlockchainName(listType)) {
        this.tokensStore.setQueryAndFetch(listType, query);
      } else {
        const utilityMap: Record<UtilityAssetType, CommonUtilityStore> = {
          allChains: this.tokensCollections.allTokens,
          trending: this.tokensCollections.trending,
          gainers: this.tokensCollections.gainers,
          losers: this.tokensCollections.losers,
          favorite: this.tokensCollections.favorite
        };

        const store = utilityMap[listType];
        store.setQuery(query);
      }
    });
  }
}
