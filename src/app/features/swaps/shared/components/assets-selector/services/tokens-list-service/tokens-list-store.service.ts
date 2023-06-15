import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  firstValueFrom,
  Observable,
  of,
  Subject,
  timer
} from 'rxjs';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import { BlockchainName, BlockchainsInfo, EvmWeb3Pure, Web3Pure } from 'rubic-sdk';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  catchError,
  distinctUntilChanged,
  filter,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators';
import { TokensList } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/models/tokens-list';
import { Token as SdkToken } from 'rubic-sdk/lib/common/tokens/token';
import BigNumber from 'bignumber.js';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { blockchainImageKey } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/constants/blockchain-image-key';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { Token } from '@shared/models/tokens/token';
import { TokensListTypeService } from '@features/swaps/shared/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { TokensListType } from '@features/swaps/shared/components/assets-selector/models/tokens-list-type';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { isMinimalToken } from '@shared/utils/is-token';
import { SwapTypeService } from '@core/services/swaps/swap-type.service';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Injectable()
export class TokensListStoreService {
  /**
   * Emits events, when list must be updated.
   */
  private readonly updateTokens$ = new Subject<void>();

  private readonly _searchLoading$ = new BehaviorSubject<boolean>(false);

  public readonly searchLoading$ = this._searchLoading$.asObservable();

  public get searchLoading(): boolean {
    return this._searchLoading$.value;
  }

  public set searchLoading(value: boolean) {
    this._searchLoading$.next(value);
  }

  private readonly _tokensToShow$ = new BehaviorSubject<AvailableTokenAmount[]>([]);

  public readonly tokensToShow$ = this._tokensToShow$.asObservable();

  public get tokensToShow(): AvailableTokenAmount[] {
    return this._tokensToShow$.value;
  }

  private set tokensToShow(value: AvailableTokenAmount[]) {
    this._tokensToShow$.next(value);
  }

  private readonly _customToken$ = new BehaviorSubject<AvailableTokenAmount>(undefined);

  public readonly customToken$ = this._customToken$.asObservable();

  public get customToken(): AvailableTokenAmount {
    return this._customToken$.value;
  }

  private set customToken(value: AvailableTokenAmount) {
    this._customToken$.next(value);
  }

  private get searchQuery(): string {
    return this.searchQueryService.query;
  }

  private get blockchain(): BlockchainName | null {
    const assetType = this.assetsSelectorService.assetType;
    if (!BlockchainsInfo.isBlockchainName(assetType)) {
      return null;
    }
    return assetType;
  }

  private get listType(): TokensListType {
    return this.tokensListTypeService.listType;
  }

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly searchQueryService: SearchQueryService,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly httpClient: HttpClient,
    private readonly swapFormService: SwapFormService,
    private readonly swapTypeService: SwapTypeService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnUpdateTokens();

    this.subscribeOnTokensChange();
    this.subscribeOnSearchQueryChange();
    this.subscribeOnBlockchainChange();
    this.subscribeOnListType();
  }

  private subscribeOnTokensChange(): void {
    combineLatest([this.tokensStoreService.tokens$, this.tokensStoreService.favoriteTokens$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.searchQuery) {
          this.updateTokens();
        }
      });
  }

  private subscribeOnSearchQueryChange(): void {
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'tokens'),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateTokens();
      });
  }

  private subscribeOnBlockchainChange(): void {
    this.assetsSelectorService.assetType$
      .pipe(
        distinctUntilChanged(),
        filter(assetType => BlockchainsInfo.isBlockchainName(assetType)),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateTokens();
      });
  }

  private subscribeOnListType(): void {
    this.tokensListTypeService.listType$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.updateTokens();
    });
  }

  private updateTokens(): void {
    this.updateTokens$.next();
  }

  /**
   * Handles tokens list update.
   * Can be called only from constructor.
   */
  private subscribeOnUpdateTokens(): void {
    this.updateTokens$
      .pipe(
        switchMap(() => {
          if (this.searchQuery.length) {
            if (this.listType === 'default') {
              return this.getDefaultTokensByQuery();
            } else {
              return of({ tokensToShow: this.getFilteredFavoriteTokens() });
            }
          }
          return of({ tokensToShow: this.getSortedTokens() });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((tokensList: TokensList) => {
        if ('tokensToShow' in tokensList) {
          this.tokensToShow =
            this.swapTypeService.getSwapProviderType() !== SWAP_PROVIDER_TYPE.LIMIT_ORDER
              ? tokensList.tokensToShow
              : tokensList.tokensToShow.filter(t => !EvmWeb3Pure.isNativeAddress(t.address));
          this.customToken = null;
        } else {
          this.tokensToShow = [];
          this.customToken = tokensList.customToken;
        }
        this.searchLoading = false;
      });
  }

  /**
   * Handles search query requests to APIs and gets parsed tokens.
   */
  private getDefaultTokensByQuery(): Observable<TokensList> {
    return timer(300).pipe(
      tap(() => (this.searchLoading = true)),
      switchMap(() => this.tryParseQueryAsBackendTokens()),
      switchMap(async backendTokens => {
        if (backendTokens?.length) {
          return { tokensToShow: backendTokens };
        }

        const customToken = await this.tryParseQueryAsCustomToken();
        if (customToken) {
          return { customToken };
        }

        return { tokensToShow: [] };
      })
    );
  }

  /**
   * Fetches tokens form backend by search query.
   */
  private tryParseQueryAsBackendTokens(): Observable<AvailableTokenAmount[]> {
    if (!this.searchQuery || !this.blockchain) {
      return of([]);
    }

    return this.tokensService.fetchQueryTokens(this.searchQuery, this.blockchain).pipe(
      map(backendTokens => {
        if (backendTokens.size) {
          return backendTokens
            .map(token => {
              return {
                ...token,
                available: this.isTokenAvailable(token),
                favorite: this.isTokenFavorite(token)
              };
            })
            .toArray();
        }
        return [];
      })
    );
  }

  /**
   * Tries to parse custom token by search query requesting Web3.
   */
  private async tryParseQueryAsCustomToken(): Promise<AvailableTokenAmount> {
    try {
      if (this.searchQuery && this.blockchain) {
        const token = await SdkToken.createToken({
          blockchain: this.blockchain,
          address: this.searchQuery.toLowerCase()
        });

        if (token?.name && token?.symbol && token?.decimals) {
          const image = await this.fetchTokenImage(token);

          return {
            ...token,
            image,
            rank: 0,
            amount: new BigNumber(NaN),
            price: 0,
            available: this.isTokenAvailable(token),
            favorite: this.isTokenFavorite(token),
            tokenSecurity: await this.getTokenSecurity(token)
          };
        }
      }
    } catch {}
    return null;
  }

  /**
   * Fetches token's image url.
   * @param token Token to display.
   * @return Promise<string> Token image url.
   */
  private async fetchTokenImage(token: BlockchainToken): Promise<string> {
    const blockchainKey = blockchainImageKey[token.blockchain];
    if (!blockchainKey) {
      return DEFAULT_TOKEN_IMAGE;
    }

    const tokenAddress = BlockchainsInfo.isEvmBlockchainName(token.blockchain)
      ? EvmWeb3Pure.toChecksumAddress(token.address)
      : token.address;
    const image = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${blockchainKey}/assets/${tokenAddress}/logo.png`;

    return firstValueFrom(
      this.httpClient.get<string>(image).pipe(
        catchError((err: unknown) => {
          return (err as HttpErrorResponse)?.status === 200 ? of(image) : of(DEFAULT_TOKEN_IMAGE);
        })
      )
    );
  }

  /**
   * Gets filtered favorite tokens by blockchain and query.
   */
  private getFilteredFavoriteTokens(): AvailableTokenAmount[] {
    const allFavoriteTokens = this.tokensStoreService.favoriteTokens.toArray();

    const query = this.searchQuery.toLowerCase();
    const filteredFavoriteTokens = allFavoriteTokens
      .filter(token => token.blockchain === this.blockchain)
      .map(token => ({
        ...token,
        available: this.isTokenAvailable(token),
        favorite: true
      }));

    if (query.startsWith('0x')) {
      return filteredFavoriteTokens.filter(token => token.address.toLowerCase().includes(query));
    } else {
      const symbolMatchingTokens = filteredFavoriteTokens.filter(token =>
        token.symbol.toLowerCase().includes(query)
      );
      const nameMatchingTokens = filteredFavoriteTokens.filter(token =>
        token.name.toLowerCase().includes(query)
      );

      return symbolMatchingTokens.concat(
        nameMatchingTokens.filter(nameToken =>
          symbolMatchingTokens.every(
            symbolToken => !compareAddresses(nameToken.address, symbolToken.address)
          )
        )
      );
    }
  }

  /**
   * Gets sorted list of default or favorite tokens.
   */
  private getSortedTokens(): AvailableTokenAmount[] {
    if (this.listType === 'default') {
      const tokens = this.tokensStoreService.tokens.toArray();

      const currentBlockchainTokens = tokens
        .filter(token => token.blockchain === this.blockchain && this.isTokenAvailable(token))
        .map(token => ({
          ...token,
          available: true,
          favorite: this.isTokenFavorite(token)
        }));
      return this.sortTokensByComparator(currentBlockchainTokens);
    } else {
      const favoriteTokens = this.tokensStoreService.favoriteTokens.toArray();

      const currentBlockchainFavoriteTokens = favoriteTokens
        .filter((token: AvailableTokenAmount) => token.blockchain === this.blockchain)
        .map(token => ({
          ...token,
          available: this.isTokenAvailable(token),
          favorite: true
        }));
      return this.sortTokensByComparator(currentBlockchainFavoriteTokens);
    }
  }

  /**
   * Sorts tokens by comparator.
   * @param tokens Tokens to perform with.
   * @return AvailableTokenAmount[] Filtered and sorted tokens.
   */
  private sortTokensByComparator(tokens: AvailableTokenAmount[]): AvailableTokenAmount[] {
    const comparator = (a: AvailableTokenAmount, b: AvailableTokenAmount) => {
      const aAmountInDollars = a.amount.isFinite()
        ? a.amount.multipliedBy(a.price)
        : new BigNumber(0);
      const bAmountInDollars = b.amount.isFinite()
        ? b.amount.multipliedBy(b.price)
        : new BigNumber(0);

      // const aAmount = a.amount.isFinite() ? a.amount : new BigNumber(0);
      // const bAmount = b.amount.isFinite() ? b.amount : new BigNumber(0);
      const amountsDelta = bAmountInDollars.minus(aAmountInDollars).toNumber();
      return Number(b.available) - Number(a.available) || amountsDelta || b.rank - a.rank;
    };

    const nativeTokenIndex = tokens.findIndex(token => {
      const chainType = BlockchainsInfo.getChainType(token.blockchain);
      return Web3Pure[chainType].isNativeAddress(token.address);
    });
    const slicedTokensArray = [
      ...tokens.slice(0, nativeTokenIndex),
      ...tokens.slice(nativeTokenIndex + 1, tokens.length)
    ];
    return [tokens[nativeTokenIndex], ...slicedTokensArray.sort(comparator)];
  }

  private isTokenFavorite(token: BlockchainToken): boolean {
    return this.tokensStoreService.favoriteTokens.some(favoriteToken =>
      compareTokens(favoriteToken, token)
    );
  }

  private isTokenAvailable(token: BlockchainToken): boolean {
    const oppositeToken = this.oppositeToken();
    return !oppositeToken || !compareTokens(oppositeToken, token);
  }

  private oppositeToken(): Token | null {
    const oppositeAssetTypeKey =
      this.assetsSelectorService.formType === 'from' ? 'toToken' : 'fromAsset';
    const oppositeAsset = this.swapFormService.inputValue[oppositeAssetTypeKey];
    return isMinimalToken(oppositeAsset) ? oppositeAsset : null;
  }

  private getTokenSecurity(token: BlockchainToken): Promise<TokenSecurity> {
    return this.tokensService.fetchTokenSecurity(token.address, token.blockchain);
  }

  public isBalanceLoading$(blockchain: BlockchainName): Observable<boolean> {
    return this.tokensStoreService.isBalanceLoading$(blockchain);
  }
}
