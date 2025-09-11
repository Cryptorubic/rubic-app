import { Injectable } from '@angular/core';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import BigNumber from 'bignumber.js';
import { map, switchMap, tap } from 'rxjs/operators';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TokensRequestQueryOptions } from 'src/app/core/services/backend/tokens-api/models/tokens';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import {
  BlockchainName,
  BlockchainsInfo,
  Injector,
  isAddressCorrect,
  Token as SdkToken,
  Web3PublicService,
  Web3Pure
} from '@cryptorubic/sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { BalanceLoaderService } from './balance-loader.service';
import { TokensUpdaterService } from './tokens-updater.service';
import { BalancePatcherFacade } from './utils/balance-patcher-facade';
import { AssetsSelectorStateService } from '@app/features/trade/components/assets-selector/services/assets-selector-state/assets-selector-state.service';
import { TokenConvertersService } from './token-converters.service';
import { TOKEN_FILTERS } from '@app/features/trade/components/assets-selector/models/token-filters';

/**
 * Service that contains actions (transformations and fetch) with tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class TokensService {
  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  private readonly balancePatcherFacade: BalancePatcherFacade;

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly balanceLoaderService: BalanceLoaderService,
    private readonly tokensUpdaterService: TokensUpdaterService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tokenConverters: TokenConvertersService
  ) {
    this.balancePatcherFacade = new BalancePatcherFacade(
      this.tokensStoreService,
      this.assetsSelectorStateService,
      this.tokenConverters
    );
  }

  /**
   * Sets default image to token, in case original image has thrown error.
   * @param $event Img error event.
   */
  public onTokenImageError($event: Event): void {
    const target = $event.target as HTMLImageElement;
    if (target.src !== DEFAULT_TOKEN_IMAGE) {
      target.src = DEFAULT_TOKEN_IMAGE;
    }
  }

  /**
   * Gets price of native token.
   * @param blockchain Blockchain of native token.
   */
  public async getNativeCoinPriceInUsd(blockchain: BlockchainName): Promise<number> {
    const nativeCoinAddress = NATIVE_TOKEN_ADDRESS;
    const nativeCoin = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeCoinAddress })
    );

    const nativeCoinPrice = await Injector.coingeckoApi.getTokenPrice({
      blockchain,
      address: nativeCoinAddress
    });

    return nativeCoinPrice.toNumber() || nativeCoin?.price;
  }

  /**
   * Gets token's price and updates tokens list.
   * @param token Tokens to get price for.
   * @param searchBackend If true and token's price was not retrieved, then request to backend with token's params is sent.
   */
  public async getTokenPrice(
    token: {
      address: string;
      blockchain: BlockchainName;
    },
    searchBackend = false
  ): Promise<BigNumber | null> {
    return firstValueFrom(
      from(Injector.coingeckoApi.getTokenPrice(token)).pipe(
        switchMap(tokenPrice => {
          if (tokenPrice) return of(tokenPrice);
          if (searchBackend) {
            return this.fetchQueryTokens(token.address, token.blockchain).pipe(
              map(backendTokens => new BigNumber(backendTokens.get(0)?.price))
            );
          }
          return of(null);
        })
      )
    );
  }

  /**
   * Gets token's balance and updates tokens list.
   * @param token Tokens to get balance for.
   */
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

      const foundTokenInCommonList = this.tokensStoreService.tokens.find(t =>
        compareTokens(t, token)
      );
      const foundTokenInAllTokens = this.tokensStoreService.allChainsTokens[
        TOKEN_FILTERS.ALL_CHAINS_ALL_TOKENS
      ].find(t => compareTokens(t, token));
      const foundTokenInTrending = this.tokensStoreService.allChainsTokens[
        TOKEN_FILTERS.ALL_CHAINS_TRENDING
      ].find(t => compareTokens(t, token));
      const foundTokenInGainers = this.tokensStoreService.allChainsTokens[
        TOKEN_FILTERS.ALL_CHAINS_GAINERS
      ].find(t => compareTokens(t, token));
      const foundTokenInLosers = this.tokensStoreService.allChainsTokens[
        TOKEN_FILTERS.ALL_CHAINS_LOSERS
      ].find(t => compareTokens(t, token));

      const foundToken =
        foundTokenInCommonList ||
        foundTokenInAllTokens ||
        foundTokenInTrending ||
        foundTokenInGainers ||
        foundTokenInLosers;

      if (!foundToken) return new BigNumber(NaN);

      const balance = Web3Pure.fromWei(balanceInWei, foundToken.decimals);
      if (foundToken && !foundToken.amount.eq(balance)) {
        const newToken = { ...foundToken, amount: balance };
        this.balancePatcherFacade.patchTokenInLists(newToken);
      }

      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const foundToken = this.tokensStoreService.tokens.find(t => compareTokens(t, token));
      return foundToken?.amount;
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

  /**
   * Fetches tokens from backend by address and network
   * @param address Token address to fetch.
   * @param blockchain Token's network.
   * @returns Promise<TokenSecurity> with token's security data.
   */
  public async fetchTokenSecurity(
    address: string,
    blockchain: BlockchainName
  ): Promise<TokenSecurity> {
    const isAddress = isAddressCorrect(address, blockchain);

    const params: TokensRequestQueryOptions = {
      network: blockchain,
      ...(isAddress && { address })
    };

    return firstValueFrom(this.tokensApiService.fetchTokenSecurity(params));
  }

  /**
   * Gets symbol of token, using currently stored tokens or blockchain request.
   */
  public async getTokenSymbol(blockchain: BlockchainName, tokenAddress: string): Promise<string> {
    const foundToken = this.tokensStoreService.tokens.find(
      token => token.blockchain === blockchain && compareAddresses(token.address, tokenAddress)
    );
    if (foundToken) {
      return foundToken?.symbol;
    }

    const token = await SdkToken.createToken({
      blockchain: blockchain,
      address: tokenAddress
    });
    return token.symbol;
  }

  /**
   * Fetches specific tokens by symbol/address from specific chain or from all chains
   */
  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName | null
  ): Observable<List<TokenAmount>> {
    return this.tokensApiService.fetchQueryTokens(query, blockchain).pipe(
      switchMap(backendTokens => {
        const filteredTokens = backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );
        return this.balanceLoaderService.getTokensWithBalance(filteredTokens);
      })
    );
  }

  public fetchQueryTokensDynamicallyAndPatch(
    query: string,
    blockchain: BlockchainName | null
  ): Observable<List<TokenAmount>> {
    return this.tokensApiService.fetchQueryTokens(query, blockchain).pipe(
      switchMap(backendTokens => {
        const filteredTokens = backendTokens.filter(
          token =>
            !(token.name.toLowerCase().includes('tether') && query.toLowerCase().includes('eth'))
        );

        return of(this.tokenConverters.getTokensWithNullBalances(filteredTokens, false));
      }),
      tap(tokensWithNullBalances => {
        this.tokensStoreService.updateLastQueriedTokensState(tokensWithNullBalances);

        const onChainLoaded = (tokensWithBalances: List<TokenAmount>) => {
          this.balancePatcherFacade.patchQueryTokensBalances(tokensWithBalances);
          this.tokensUpdaterService.triggerUpdateTokens({ skipRefetch: true });
        };

        // allChains
        if (!blockchain) {
          this.balanceLoaderService.updateBalancesForAllChains(tokensWithNullBalances, {
            onChainLoaded
          });
        } else {
          this.balanceLoaderService.updateBalancesForSpecificChain(
            tokensWithNullBalances,
            blockchain,
            onChainLoaded
          );
        }
      })
    );
  }

  /**
   * Gets token by address.
   * @param token Tokens's data to find it by.
   * @param searchBackend If true and token was not retrieved, then request to backend with token's params is sent.
   */
  public async findToken(token: MinimalToken, searchBackend = false): Promise<TokenAmount> {
    const foundToken = this.tokensStoreService.tokens.find(t => compareTokens(t, token));
    if (foundToken) {
      return foundToken;
    }

    if (searchBackend) {
      return firstValueFrom(
        this.fetchQueryTokens(token.address, token.blockchain).pipe(
          map(backendTokens => backendTokens.get(0))
        )
      );
    }

    return null;
  }
}
