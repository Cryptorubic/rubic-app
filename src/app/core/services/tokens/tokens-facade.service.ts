import { inject, Injectable } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';

import { BalanceToken } from '@shared/models/tokens/balance-token';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { Observable } from 'rxjs';
import BigNumber from 'bignumber.js';
import { debounceTime } from 'rxjs/operators';
import { List } from 'immutable';
import { AssetListType } from '@features/trade/models/asset';
import { BlockchainTokenState, TokensState } from '@core/services/tokens/models/new-token-types';
import { Token } from '@shared/models/tokens/token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';

import { BlockchainName } from '@cryptorubic/core';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { AllTokensUtilityStore } from '@core/services/tokens/models/all-tokens-utility-store';
import { TrendingUtilityStore } from '@core/services/tokens/models/tranding-utility-store';
import { GainersUtilityStore } from '@core/services/tokens/models/gainers-utility-store';
import { LosersUtilityStore } from '@core/services/tokens/models/losers-utility-store';
import { FavoriteUtilityStore } from '@core/services/tokens/models/favorite-utility-store';
import { TokensBootstrapService } from '@core/services/tokens/tokens-bootstrap.service';
import { TokensBalanceService } from '@core/services/tokens/tokens-balance.service';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { TokensRegistryService } from '@core/services/tokens/tokens-registry.service';
import { TokensQueryService } from '@core/services/tokens/tokens-query.service';
import { TokensBuilderService } from '@core/services/tokens/tokens-builder.service';
import { TokensPaginationService } from '@core/services/tokens/tokens-pagination.service';

@Injectable({
  providedIn: 'root'
})
export class TokensFacadeService {
  private readonly tokensCollectionFacade = inject(TokensCollectionsFacadeService);

  private readonly tokensBootstrapService = inject(TokensBootstrapService);

  private readonly tokensBalanceService = inject(TokensBalanceService);

  private readonly tokensRegistryService = inject(TokensRegistryService);

  private readonly tokensQueryService = inject(TokensQueryService);

  private readonly tokensBuilderService = inject(TokensBuilderService);

  private readonly tokensPaginationService = inject(TokensPaginationService);

  public get nativeToken$(): Observable<BalanceToken | null> {
    return this.tokensRegistryService.nativeToken$;
  }

  public get tokenQuery$(): TokensQueryService['tokenQuery$'] {
    return this.tokensQueryService.tokenQuery$;
  }

  public static onTokenImageError($event: Event): void {
    const target = $event.target as HTMLImageElement;
    if (target.src !== DEFAULT_TOKEN_IMAGE) {
      target.src = DEFAULT_TOKEN_IMAGE;
    }
  }

  public readonly tokens$: Observable<BalanceToken[]> = this.tokensStore.allTokens$.pipe(
    debounceTime(20)
  );

  public get blockchainTokens(): TokensState {
    return this.tokensCollectionFacade.blockchainTokens;
  }

  /**
   * Current tokens list.
   */
  public get tokens(): List<BalanceToken> {
    const tokensList = this.tokensStore.getAllTokens();
    return List(tokensList);
  }

  public get allTokens(): AllTokensUtilityStore {
    return this.tokensCollectionFacade.allTokens;
  }

  public get trending(): TrendingUtilityStore {
    return this.tokensCollectionFacade.trending;
  }

  public get gainers(): GainersUtilityStore {
    return this.tokensCollectionFacade.gainers;
  }

  public get losers(): LosersUtilityStore {
    return this.tokensCollectionFacade.losers;
  }

  public get favorite(): FavoriteUtilityStore {
    return this.tokensCollectionFacade.favorite;
  }

  public get tier1TokensLoaded$(): Observable<boolean> {
    return this.tokensBootstrapService.tier1TokensLoaded$;
  }

  constructor(private readonly tokensStore: NewTokensStoreService) {
    this.tokensBootstrapService.buildTokenLists();
    this.tokensBalanceService.initSubscribes();
    this.tokensQueryService.subscribeOnQuery();
  }

  public async findToken(token: MinimalToken, searchBackend = false): Promise<BalanceToken | null> {
    return this.tokensRegistryService.findToken(token, searchBackend);
  }

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): Observable<Token[]> {
    return this.tokensRegistryService.fetchQueryTokens(query, blockchain);
  }

  public addFavoriteToken(favoriteToken: BalanceToken): Observable<unknown> {
    return this.favorite.addFavoriteToken(favoriteToken);
  }

  public removeFavoriteToken(token: BalanceToken): Observable<unknown> {
    return this.favorite.removeFavoriteToken(token);
  }

  public getTokensBasedOnType(type: AssetListType): BlockchainTokenState | CommonUtilityStore {
    return this.tokensBuilderService.getTokensBasedOnType(type);
  }

  public getTokensList(
    type: AssetListType,
    _query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.tokensBuilderService.getTokensList(type, _query, direction, inputValue);
  }

  public async updateTokenBalanceAfterCcrSwap(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<void> {
    return this.tokensBalanceService.updateTokenBalanceAfterCcrSwap(fromToken, toToken);
  }

  public async updateParticipantTokens(): Promise<void> {
    await this.tokensBalanceService.updateParticipantTokens();
  }

  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    return this.tokensBalanceService.getAndUpdateTokenBalance(token);
  }

  public async updateTokenBalancesAfterItSwap(
    fromToken: {
      address: string;
      blockchain: BlockchainName;
    },
    toToken: {
      address: string;
      blockchain: BlockchainName;
    }
  ): Promise<void> {
    return this.tokensBalanceService.updateTokenBalancesAfterItSwap(fromToken, toToken);
  }

  public async getLatestPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber | null> {
    return this.tokensRegistryService.getLatestPrice(token);
  }

  public addToken(token: BalanceToken): void {
    this.tokensRegistryService.addToken(token);
  }

  public findTokenSync(token: MinimalToken, _searchBackend = false): BalanceToken | null {
    return this.tokensRegistryService.findTokenSync(token, _searchBackend);
  }

  public addTokenByAddress(address: string, blockchain: BlockchainName): Observable<BalanceToken> {
    return this.tokensRegistryService.addTokenByAddress(address, blockchain);
  }

  public buildSearchedList(query: string, assetListType: AssetListType): void {
    return this.tokensQueryService.buildSearchedList(query, assetListType);
  }

  public runFetchConditionally(listType: AssetListType, searchQuery: string | null): void {
    this.tokensPaginationService.runFetchConditionally(listType, searchQuery);
  }

  public fetchNewPage(tokenState: BlockchainTokenState, skipLoading: boolean): void {
    this.tokensPaginationService.fetchNewPage(tokenState, skipLoading);
  }
}
