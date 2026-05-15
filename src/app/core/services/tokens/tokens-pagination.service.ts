import { inject, Injectable } from '@angular/core';
import { BlockchainTokenState } from '@core/services/tokens/models/new-token-types';
import { AssetListType } from '@features/trade/models/asset';
import { BlockchainsInfo } from '@cryptorubic/core';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { TokensBuilderService } from '@core/services/tokens/tokens-builder.service';

@Injectable({
  providedIn: 'root'
})
export class TokensPaginationService {
  private readonly apiService = inject(NewTokensApiService);

  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly collection = inject(TokensCollectionsFacadeService);

  private readonly tokensBuilder = inject(TokensBuilderService);

  public fetchNewPage(tokenState: BlockchainTokenState, skipLoading: boolean): void {
    if (!tokenState.allowFetching) {
      return;
    }
    const blockchain = tokenState.blockchain;
    if (!skipLoading) {
      this.collection.blockchainTokens[blockchain]._pageLoading$.next(true);
    }

    this.apiService.getNewPage(tokenState.page + 1, blockchain).subscribe(response => {
      this.tokensStore.addInitialBlockchainTokens(blockchain, response);
      this.collection.blockchainTokens[blockchain]._pageLoading$.next(false);
    });
  }

  private fetchSecondPage(tokenState: BlockchainTokenState): void {
    const blockchain = tokenState.blockchain;

    this.apiService.getNewPage(tokenState.page + 1, blockchain).subscribe(response => {
      this.tokensStore.addInitialBlockchainTokens(blockchain, response);
      this.collection.blockchainTokens[blockchain]._pageLoading$.next(false);
    });
  }

  public runFetchConditionally(listType: AssetListType, searchQuery: string | null): void {
    if (BlockchainsInfo.isBlockchainName(listType) && !searchQuery) {
      const tokensObject = this.tokensBuilder.getTokensBasedOnType(
        listType
      ) as BlockchainTokenState;
      if (tokensObject.page === 1 && tokensObject.allowFetching) {
        this.fetchSecondPage(tokensObject);
      }
    }
  }
}
