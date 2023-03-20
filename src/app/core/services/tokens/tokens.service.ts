import { Injectable } from '@angular/core';
import { firstValueFrom, from, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokensApiService } from 'src/app/core/services/backend/tokens-api/tokens-api.service';
import BigNumber from 'bignumber.js';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';
import { TokensRequestQueryOptions } from 'src/app/core/services/backend/tokens-api/models/tokens';
import { DEFAULT_TOKEN_IMAGE } from '@shared/constants/tokens/default-token-image';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { TokenSecurity } from '@shared/models/tokens/token-security';
import {
  BlockchainName,
  Web3Pure,
  Injector,
  Token as SdkToken,
  BlockchainsInfo,
  Web3PublicService,
  isAddressCorrect,
  BLOCKCHAIN_NAME
} from 'rubic-sdk';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { List } from 'immutable';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TO_BACKEND_BLOCKCHAINS } from '@shared/constants/blockchain/backend-blockchains';
import { MinimalToken } from '@shared/models/tokens/minimal-token';

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

  constructor(
    private readonly tokensApiService: TokensApiService,
    private readonly authService: AuthService,
    private readonly coingeckoApiService: CoingeckoApiService,
    private readonly tokensStoreService: TokensStoreService
  ) {}

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
  public getNativeCoinPriceInUsd(blockchain: BlockchainName): Promise<number> {
    const nativeCoinAddress = NATIVE_TOKEN_ADDRESS;
    const nativeCoin = this.tokensStoreService.tokens.find(token =>
      compareTokens(token, { blockchain, address: nativeCoinAddress })
    );
    return firstValueFrom(
      this.coingeckoApiService
        .getNativeCoinPrice(blockchain)
        .pipe(map(price => price || nativeCoin?.price))
    );
  }

  /**
   * Gets token's price and updates tokens list.
   * @param token Tokens to get price for.
   * @param searchBackend If true and token's price was not retrieved, then request to backend with token's params is sent.
   */
  public getAndUpdateTokenPrice(
    token: {
      address: string;
      blockchain: BlockchainName;
    },
    searchBackend = false
  ): Promise<number | null> {
    return firstValueFrom(
      this.coingeckoApiService.getCommonTokenOrNativeCoinPrice(token).pipe(
        map(tokenPrice => {
          if (tokenPrice) {
            return tokenPrice;
          }
          return null;
          // @TODO Uncomment after coingecko refactoring.
          // const foundToken = this.tokens?.find(t => TokensService.compareTokens(t, token));
          // return foundToken?.price;
        }),
        switchMap(tokenPrice => {
          if (!tokenPrice && searchBackend) {
            return this.fetchQueryTokens(token.address, token.blockchain).pipe(
              map(backendTokens => backendTokens.get(0)?.price)
            );
          }
          return of(tokenPrice);
        }),
        tap(tokenPrice => {
          if (tokenPrice) {
            const foundToken = this.tokensStoreService.tokens?.find(t => compareTokens(t, token));
            if (foundToken) {
              const newToken = {
                ...foundToken,
                price: tokenPrice
              };
              this.tokensStoreService.patchToken(newToken);
            }
          }
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
      const balanceInWei = Web3Pure[chainType].isNativeAddress(token.address)
        ? await blockchainAdapter.getBalance(this.userAddress)
        : await blockchainAdapter.getTokenBalance(this.userAddress, token.address);

      const foundToken = this.tokensStoreService.tokens.find(t => compareTokens(t, token));
      if (!foundToken) {
        return new BigNumber(NaN);
      }
      const balance = Web3Pure.fromWei(balanceInWei, foundToken.decimals);
      if (!foundToken.amount.eq(balance)) {
        const newToken = {
          ...foundToken,
          amount: balance
        };
        this.tokensStoreService.patchToken(newToken);
      }
      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const foundToken = this.tokensStoreService.tokens.find(t => compareTokens(t, token));
      return foundToken?.amount;
    }
  }

  public async updateNativeTokenBalance(blockchain: BlockchainName): Promise<void> {
    const chainType = BlockchainsInfo.getChainType(blockchain);
    await this.getAndUpdateTokenBalance({
      address: Web3Pure[chainType].nativeTokenAddress,
      blockchain
    });
  }

  public async updateTokenBalanceAfterCcrSwap(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<void> {
    const chainType = BlockchainsInfo.getChainType(token.blockchain);
    if (Web3Pure[chainType].isNativeAddress(token.address)) {
      await this.getAndUpdateTokenBalance(token);
    } else {
      await Promise.all([
        this.getAndUpdateTokenBalance(token),
        this.getAndUpdateTokenBalance({
          address: Web3Pure[chainType].nativeTokenAddress,
          blockchain: token.blockchain
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
    if (!Web3Pure[fromChainType].isNativeAddress(fromToken.address)) {
      balancePromises.concat(
        this.getAndUpdateTokenBalance({
          address: Web3Pure[fromChainType].nativeTokenAddress,
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
   * Fetches tokens from backend by search query string.
   * @param query Search query.
   * @param blockchain Tokens blockchain.
   */
  public fetchQueryTokens(
    query: string,
    blockchain: BlockchainName
  ): Observable<List<TokenAmount>> {
    if (blockchain !== BLOCKCHAIN_NAME.TRON) {
      query = query.toLowerCase();
    }

    return from(isAddressCorrect(query, blockchain)).pipe(
      catchError(() => of(false)),
      switchMap(isAddress => {
        const isLifiTokens = !TO_BACKEND_BLOCKCHAINS[blockchain];

        if (isLifiTokens) {
          return of(
            this.tokensStoreService.tokens.filter(
              token =>
                token.blockchain === blockchain &&
                ((isAddress && compareAddresses(token.address, query)) ||
                  (!isAddress &&
                    (token.name.toLowerCase().includes(query) ||
                      token.symbol.toLowerCase().includes(query))))
            )
          );
        } else {
          const params: TokensRequestQueryOptions = {
            network: blockchain,
            ...(!isAddress && { symbol: query }),
            ...(isAddress && { address: query })
          };

          return this.tokensApiService.fetchQueryTokens(params).pipe(
            switchMap(backendTokens => {
              return this.tokensStoreService.getTokensWithBalance(backendTokens);
            })
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
