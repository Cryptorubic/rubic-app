import { Injectable } from '@angular/core';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';

import { BalanceToken } from '@shared/models/tokens/balance-token';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { BehaviorSubject, firstValueFrom, Observable, of } from 'rxjs';
import {
  BlockchainName,
  BlockchainsInfo,
  ChainType,
  Injector,
  Web3Public,
  Web3PublicService,
  Web3Pure
} from '@cryptorubic/sdk';
import BigNumber from 'bignumber.js';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  map,
  switchMap
} from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { List } from 'immutable';
import { AssetListType, UtilityAssetType } from '@features/trade/models/asset';
import { BlockchainTokenState } from '@core/services/tokens/models/new-token-types';
import { Token } from '@shared/models/tokens/token';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { SwapFormInput } from '@features/trade/models/swap-form-controls';
import { LosersUtilityStore } from '@core/services/tokens/models/losers-utility-store';
import { TrendingUtilityStore } from '@core/services/tokens/models/tranding-utility-store';
import { GainersUtilityStore } from '@core/services/tokens/models/gainers-utility-store';
import { AllTokensUtilityStore } from '@core/services/tokens/models/all-tokens-utility-store';
import { FavoriteUtilityStore } from '@core/services/tokens/models/favorite-utility-store';
import { CommonUtilityStore } from '@core/services/tokens/models/common-utility-store';
import { SearchQueryUtilityStore } from '@core/services/tokens/models/search-query-utility-store';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { sorterByChain } from '@features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { BLOCKCHAIN_NAME, nativeTokensList, TEST_EVM_BLOCKCHAIN_NAME } from '@cryptorubic/core';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';

@Injectable({
  providedIn: 'root'
})
export class TokensFacadeService {
  private tier1BalanceChains: BlockchainName[] = [
    'METIS',
    'UNICHAIN',
    'BLAST',
    'FUSE',
    'MORPH',
    'MODE',
    'FANTOM',
    'AVALANCHE',
    'CRONOS',
    'CORE',
    'ROOTSTOCK',
    'BOBA',
    'KLAYTN',
    'BASE',
    'MANTA_PACIFIC',
    'MOONRIVER',
    'GRAVITY',
    'TELOS',
    'GNOSIS',
    'ETH',
    // 'VANA',
    'ARBITRUM',
    'XLAYER',
    'BERACHAIN',
    'MOONBEAM',
    'HEMI',
    // 'SONIC',
    'ZETACHAIN',
    'MERLIN',
    'POLYGON',
    'SONEIUM',
    'FLARE',
    'ZK_SYNC',
    'SCROLL',
    'BSC',
    // 'HYPER_EVM',
    'KAVA',
    'FRAXTAL',
    // 'PLASMA',
    'ASTAR_EVM',
    'OPTIMISM',
    'TAIKO',
    'CELO',
    'SEI',
    'MANTLE',
    'LINEA',
    'BITLAYER'
  ];

  public readonly allTokens = new AllTokensUtilityStore(this.tokensStore, this.apiService).init();

  public readonly trending = new TrendingUtilityStore(this.tokensStore, this.apiService).init();

  public readonly gainers = new GainersUtilityStore(this.tokensStore, this.apiService).init();

  public readonly losers = new LosersUtilityStore(this.tokensStore, this.apiService).init();

  public readonly favorite = new FavoriteUtilityStore(
    this.tokensStore,
    this.apiService,
    this.authService
  ).init();

  public readonly searched = new SearchQueryUtilityStore(this.tokensStore, this.apiService).init();

  public readonly nativeToken$ = this.formService.fromBlockchain$.pipe(
    switchMap(blockchain => {
      const chainType = BlockchainsInfo.getChainType(blockchain);
      const address = Web3Pure[chainType].nativeTokenAddress;

      return this.findToken({ address, blockchain });
    })
  );

  public static onTokenImageError($event: Event): void {
    const target = $event.target as HTMLImageElement;
    if (target.src !== DEFAULT_TOKEN_IMAGE) {
      target.src = DEFAULT_TOKEN_IMAGE;
    }
  }

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  public readonly tokens$: Observable<BalanceToken[]> = this.tokensStore.allTokens$.pipe(
    debounceTime(20)
  );

  public readonly blockchainTokens = this.tokensStore.tokens;

  private readonly _tier1TokensLoaded$ = new BehaviorSubject<boolean>(false);

  public readonly tier1TokensLoaded$ = this._tier1TokensLoaded$.asObservable();

  /**
   * Current tokens list.
   */
  public get tokens(): List<BalanceToken> {
    const allTokens = this.tokensStore.getAllTokens();
    return List(allTokens);
  }

  constructor(
    private readonly tokensStore: NewTokensStoreService,
    private readonly apiService: NewTokensApiService,
    private readonly authService: AuthService,
    private readonly formService: SwapsFormService
  ) {
    this.buildTokenLists();
    this.subscribeOnWallet();
    this.pollFormTokenBalance();
  }

  private buildTokenLists(): void {
    this.buildTier1List();
    this.buildTier2List();
  }

  private buildTier1List(): void {
    this.apiService.getTopTokens().subscribe(tokens => {
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
      const tokensArray = Object.values(tokens)
        .map(el => el.list)
        .flat();
      this.allTokens.updateTokenSync(tokensArray);
      this._tier1TokensLoaded$.next(true);
    });
  }

  private buildTier2List(): void {
    this.apiService.getRestTokens().subscribe(tokens => {
      const tokensList = Object.entries(tokens).flatMap(el => el[1].list);
      Object.entries(tokens).forEach(([blockchain, blockchainTokens]) => {
        this.tokensStore.addInitialBlockchainTokens(blockchain as BlockchainName, blockchainTokens);
      });
      this.allTokens.updateTokenSync(tokensList);
    });
  }

  public async findToken(token: MinimalToken, searchBackend = false): Promise<BalanceToken | null> {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    if (searchBackend) {
      return firstValueFrom(
        this.fetchQueryTokens(token.address, token.blockchain).pipe(
          map(backendTokens =>
            backendTokens.length
              ? { ...backendTokens[0], amount: new BigNumber(NaN), favorite: false }
              : null
          )
        )
      );
    }

    return null;
  }

  public findTokenSync(token: MinimalToken, _searchBackend = false): BalanceToken | null {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    return null;
  }

  public async getLatestPrice(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber | null> {
    return firstValueFrom(
      this.apiService
        .fetchQueryTokens(token.address, token.blockchain)
        .pipe(map(backendTokens => new BigNumber(backendTokens?.[0]?.price)))
    );
  }

  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    const chainType = BlockchainsInfo.getChainType(token.blockchain);
    const isAddressCorrectValue = await Web3Pure[chainType].isAddressCorrect(this.userAddress);

    if (
      !this.userAddress ||
      !chainType ||
      !isAddressCorrectValue ||
      !Web3PublicService.isSupportedBlockchain(token.blockchain)
    ) {
      return null;
    }

    try {
      const blockchainAdapter = Injector.web3PublicService.getWeb3Public(token.blockchain);
      const balanceInWei = await blockchainAdapter.getBalance(this.userAddress, token.address);

      const storedToken = this.findTokenSync(token);
      if (!token) return new BigNumber(NaN);

      const balance = Web3Pure.fromWei(balanceInWei, storedToken.decimals);
      if (storedToken && !storedToken.amount.eq(balance)) {
        // @TODO TOKENS
        // const newToken = { ...token, amount: balance };
        // this.updateBalance(newToken)
      }

      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const storedToken = this.findTokenSync(token);
      return storedToken?.amount;
    }
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
    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);

    if (Web3Pure[chainType].isNativeAddress(fromToken.address)) {
      await this.getAndUpdateTokenBalance(fromToken);
      await this.getAndUpdateTokenBalance(toToken);
    } else {
      await Promise.all([
        this.getAndUpdateTokenBalance(fromToken),
        this.getAndUpdateTokenBalance(toToken),
        this.getAndUpdateTokenBalance({
          address: Web3Pure[chainType].nativeTokenAddress,
          blockchain: fromToken.blockchain
        })
      ]);
    }
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
    const balancePromises = [
      this.getAndUpdateTokenBalance(fromToken),
      this.getAndUpdateTokenBalance(toToken)
    ];
    const fromChainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const web3Pure = Web3Pure[fromChainType];

    if (
      !web3Pure.isNativeAddress(fromToken.address) &&
      !web3Pure.isNativeAddress(toToken.address)
    ) {
      balancePromises.concat(
        this.getAndUpdateTokenBalance({
          address: web3Pure.nativeTokenAddress,
          blockchain: fromToken.blockchain
        })
      );
    }
    await Promise.all(balancePromises);
  }

  public fetchQueryTokens(query: string, blockchain: BlockchainName | null): Observable<Token[]> {
    return this.apiService.fetchQueryTokens(query, blockchain).pipe(
      map(backendTokens => {
        return backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );
        // // @TODO TOKENS ADD BALANCE FETCHING
        // throw Error('Method not implemented.');
        // // return this.balanceLoaderService.getTokensWithBalance(filteredTokens);
      })
    );
  }

  public addFavoriteToken(favoriteToken: BalanceToken): Observable<unknown> {
    return this.favorite.addFavoriteToken(favoriteToken);
  }

  public removeFavoriteToken(token: BalanceToken): Observable<unknown> {
    return this.favorite.removeFavoriteToken(token);
  }

  /**
   * Adds new token to tokens list.
   * @param token Tokens to add.
   */
  public addToken(_token: BalanceToken): void {
    // @TODO TOKENS ADD TOKEN
    // if (!this.tokens.find(t => compareTokens(t, token))) {
    //   const tokens = this.tokens.push(token);
    //   this.updateCommonTokensState(tokens);
    // }
  }

  public addTokenByAddress(
    _address: string,
    _blockchain: BlockchainName
  ): Observable<BalanceToken> {
    // @TODO TOKENS
    throw Error('Method not implemented.');
    // const blockchainAdapter = Injector.web3PublicService.getWeb3Public(
    //   blockchain as EvmBlockchainName
    // );
    // const chainType = BlockchainsInfo.getChainType(blockchain);
    // const balance$ =
    //   this.userAddress && this.authService.userChainType === chainType
    //     ? from(blockchainAdapter.getTokenBalance(this.userAddress, address))
    //     : of(null);
    // const token$ = SdkToken.createToken({ blockchain, address });
    //
    // return forkJoin([token$, balance$]).pipe(
    //   map(([token, amount]) => ({
    //     blockchain,
    //     address,
    //     name: token.name,
    //     symbol: token.symbol,
    //     decimals: token.decimals,
    //     image: '',
    //     rank: 1,
    //     price: null as number | null,
    //     amount: amount || new BigNumber(NaN)
    //   })),
    //   tap((_token: TokenAmount) => {
    //     // @TODO TOKENS ADD TO STORE
    //     // const tokens = this.tokens.push(token);
    //     // this.updateCommonTokensState(tokens);
    //   })
    // );
  }

  public getTokensBasedOnType(
    type: AssetListType,
    query: string = ''
  ): BlockchainTokenState | CommonUtilityStore {
    const searchTokens = Boolean(query && query?.length >= 2);

    if (BlockchainsInfo.isBlockchainName(type)) {
      return searchTokens ? this.searched : this.blockchainTokens[type];
    }

    const utilityMap: Record<UtilityAssetType, CommonUtilityStore> = {
      allChains: this.allTokens,
      trending: this.trending,
      gainers: this.gainers,
      losers: this.losers,
      favorite: this.favorite
    };

    const store = utilityMap[type];
    store.setQuery(query);

    return store;
  }

  public getTokensList(
    type: AssetListType,
    query: string,
    direction: 'from' | 'to',
    inputValue: SwapFormInput
  ): Observable<AvailableTokenAmount[]> {
    return this.getTokensBasedOnType(type, query).tokens$.pipe(
      map((tokens: BalanceToken[]) =>
        tokens
          .map(token => {
            const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
            const isAvailable = oppositeToken ? !compareTokens(token, oppositeToken) : true;
            return {
              ...token,
              available: isAvailable,
              amount: token?.amount?.gt(0) ? token.amount : new BigNumber(NaN)
            };
          })
          .sort(sorterByChain)
          .sort((a, b) => {
            const oppositeToken = direction === 'from' ? inputValue.toToken : inputValue.fromToken;
            if (oppositeToken) {
              if (
                a.address === oppositeToken.address &&
                a.blockchain === oppositeToken.blockchain
              ) {
                return 1;
              }
              if (
                b.address === oppositeToken.address &&
                b.blockchain === oppositeToken.blockchain
              ) {
                return -1;
              }
            }

            return a.rank > b.rank ? -1 : 1;
          })
      )
    );
  }

  public fetchNewPage(tokenState: BlockchainTokenState, skipLoading: boolean): void {
    if (!tokenState.allowFetching) {
      return;
    }
    const blockchain = tokenState.blockchain;
    if (!skipLoading) {
      this.blockchainTokens[blockchain]._pageLoading$.next(true);
    }

    this.apiService.getNewPage(tokenState.page + 1, blockchain).subscribe(response => {
      this.tokensStore.addInitialBlockchainTokens(blockchain, response);
      this.blockchainTokens[blockchain]._pageLoading$.next(false);
    });
  }

  public fetchSecondPage(tokenState: BlockchainTokenState): void {
    const blockchain = tokenState.blockchain;

    this.apiService.getNewPage(tokenState.page + 1, blockchain).subscribe(response => {
      this.tokensStore.addInitialBlockchainTokens(blockchain, response);
      this.blockchainTokens[blockchain]._pageLoading$.next(false);
    });
  }

  public buildSearchedList(query: string, blockchain: BlockchainName | null): void {
    return this.searched.handleSearchQuery(query, blockchain);
  }

  public runFetchConditionally(listType: AssetListType, searchQuery: string | null): void {
    if (BlockchainsInfo.isBlockchainName(listType) && !searchQuery) {
      const tokensObject = this.getTokensBasedOnType(listType) as BlockchainTokenState;
      if (tokensObject.page === 1 && tokensObject.allowFetching) {
        this.fetchSecondPage(tokensObject);
      }
    }
  }

  public subscribeOnWallet(): void {
    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((oldValue, newValue) =>
          compareAddresses(oldValue?.address, newValue?.address)
        )
      )
      .subscribe(user => {
        if (user?.address) {
          Promise.all([
            this.fetchT1Balances(user.address),
            this.fetchT2Balances(user.address, user.chainType)
          ]).then(([successT1request]) => {
            if (!successT1request) {
              this.fetchListBalances(user.address, this.tier1BalanceChains);
            }
          });
        } else {
          this.tokensStore.clearAllBalances();
        }
      });
  }

  private async fetchT1Balances(address: string): Promise<boolean> {
    this.tier1BalanceChains.forEach(chain =>
      this.tokensStore.tokens[chain]._balanceLoading$.next(true)
    );
    return new Promise(resolve => {
      this.apiService
        .getBackendBalances(address)
        .pipe(catchError(() => of(null)))
        .subscribe(el => {
          if (!el) {
            resolve(false);
          }
          Object.entries(el).forEach(([blockchain, tokens]) => {
            this.tokensStore.addBlockchainBalanceTokens(
              blockchain as BlockchainName,
              tokens as RubicAny
            );
            this.tokensStore.tokens[blockchain as BlockchainName]._balanceLoading$.next(false);
            resolve(true);
          });
        });
    });
  }

  private async fetchListBalances(address: string, chains: BlockchainName[]): Promise<void> {
    return new Promise(resolve => {
      chains.forEach((chain, index) => {
        const web3Public = Injector.web3PublicService.getWeb3Public(chain) as Web3Public;
        firstValueFrom(
          this.tokensStore.tokens[chain].pageLoading$.pipe(first(loading => loading === false))
        ).then(() => {
          this.tokensStore.tokens[chain]._balanceLoading$.next(true);
          const tokensObject = this.blockchainTokens[chain].getTokens();
          const tokens = Object.values(tokensObject).map(token => token.address);

          web3Public
            .getTokensBalances(address, tokens)
            .catch(() => tokens.map(() => new BigNumber(NaN)))
            .then(balances => {
              const tokensWithBalances = Object.values(tokensObject).map((token, idx) => ({
                ...token,
                amount: balances?.[idx]?.gt(0)
                  ? Web3Pure.fromWei(balances[idx], token.decimals)
                  : new BigNumber(NaN)
              })) as BalanceToken[];
              const tokensWithNotNullBalance = tokensWithBalances.filter(t => !t.amount.isNaN());

              this.tokensStore.addBlockchainBalanceTokens(chain, tokensWithNotNullBalance);
              this.tokensStore.tokens[chain]._balanceLoading$.next(false);

              if (chain.length === index) {
                resolve();
              }
            });
        });
      });
    });
  }

  private async fetchT2Balances(address: string, type: ChainType): Promise<void> {
    const blChains: BlockchainName[] = Object.values(TEST_EVM_BLOCKCHAIN_NAME);
    const chains = Object.values(BLOCKCHAIN_NAME).filter(
      (chain: BlockchainName) =>
        !this.tier1BalanceChains.includes(chain) &&
        !blChains.includes(chain) &&
        type === BlockchainsInfo.getChainType(chain)
    );

    return this.fetchListBalances(address, chains);
  }

  public async fetchTokenBalance(
    tokenAddress: string,
    blockchain: BlockchainName
  ): Promise<BalanceToken> {
    const foundToken = this.findTokenSync({ address: tokenAddress, blockchain });
    const web3Public = Injector.web3PublicService.getWeb3Public(blockchain) as Web3Public;
    const chainBalancesPromise = web3Public
      .getTokenBalance(this.authService.userAddress, tokenAddress)
      .catch(() => new BigNumber(NaN));
    //
    return chainBalancesPromise.then(balance => {
      return { ...foundToken, amount: Web3Pure.fromWei(balance, foundToken.decimals) };
    });
  }

  private pollFormTokenBalance(): void {
    this.formService.fromToken$
      .pipe(
        distinctUntilChanged(compareTokens),
        switchMap(token => {
          if (token) {
            return this.getAndUpdateTokenBalance({
              address: token.address,
              blockchain: token.blockchain
            });
          }
          return of(null);
        })
      )
      .subscribe();
  }

  public async updateParticipantTokens(): Promise<void> {
    const fromToken = this.formService.inputValue.fromToken;
    const toToken = this.formService.inputValue.toToken;
    const nativeToken = nativeTokensList[fromToken.blockchain];

    await Promise.all([
      this.getAndUpdateTokenBalance(fromToken),
      this.getAndUpdateTokenBalance(toToken),
      this.getAndUpdateTokenBalance(nativeToken)
    ]);
  }
}
