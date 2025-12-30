import { inject, Injectable } from '@angular/core';
import {
  BLOCKCHAIN_NAME,
  BlockchainName,
  BlockchainsInfo,
  CHAIN_TYPE,
  ChainType,
  nativeTokensList,
  TEST_EVM_BLOCKCHAIN_NAME,
  Token as OldToken
} from '@cryptorubic/core';
import BigNumber from 'bignumber.js';
import { AbstractAdapter, Web3Pure } from '@cryptorubic/web3';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { catchError, debounceTime, distinctUntilChanged, first, switchMap } from 'rxjs/operators';
import { combineLatestWith, firstValueFrom, of } from 'rxjs';
import { BackendBalanceToken } from '@core/services/backend/tokens-api/models/tokens';
import { Token } from '@shared/models/tokens/token';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { sorterByTokenRank } from '@features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { AuthService } from '@core/services/auth/auth.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { SdkLegacyService } from '@core/services/sdk/sdk-legacy/sdk-legacy.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { MinimalToken } from '@shared/models/tokens/minimal-token';

@Injectable({
  providedIn: 'root'
})
export class TokensBalanceService {
  private readonly formService = inject(SwapsFormService);

  private readonly authService = inject(AuthService);

  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly apiService = inject(NewTokensApiService);

  private readonly sdkLegacyService = inject(SdkLegacyService);

  private readonly configService = inject(PlatformConfigurationService);

  private readonly collectionsFacade = inject(TokensCollectionsFacadeService);

  public initSubscribes(): void {
    this.subscribeOnWallet();
    this.pollFormTokenBalance();
    this.subscribeOnFormTokens();
  }

  private findTokenSync(token: MinimalToken, _searchBackend = false): BalanceToken | null {
    const foundToken =
      this.tokensStore.tokens[token.blockchain]._tokensObject$.value[token.address];
    if (foundToken) {
      return foundToken;
    }

    return null;
  }

  private get userAddress(): string | undefined {
    return this.authService.userAddress;
  }

  public async getAndUpdateTokenBalance(token: {
    address: string;
    blockchain: BlockchainName;
  }): Promise<BigNumber> {
    const chainType = BlockchainsInfo.getChainType(token.blockchain);
    const isAddressCorrectValue = await Web3Pure.isAddressCorrect(
      token.blockchain,
      this.userAddress
    );

    if (
      !this.userAddress ||
      !chainType ||
      !isAddressCorrectValue
      // @TODO CHECK IF BLOCKCHAIN SUPPORTED
    ) {
      return null;
    }

    try {
      const blockchainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        token.blockchain as RubicAny
      );
      const balanceInWei = await blockchainAdapter.getBalance(this.userAddress, token.address);

      const storedToken = this.findTokenSync(token);
      if (!token) return new BigNumber(NaN);

      const balance = OldToken.fromWei(balanceInWei, storedToken.decimals);
      if (storedToken && !storedToken.amount?.eq(balance)) {
        const tokensObject = this.tokensStore.tokens[token.blockchain]._tokensObject$;
        this.tokensStore.tokens[token.blockchain]._tokensObject$.next({
          ...tokensObject.getValue(),
          [token.address]: { ...storedToken, amount: balance }
        });
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

    if (Web3Pure.isNativeAddress(chainType, fromToken.address)) {
      await this.getAndUpdateTokenBalance(fromToken);
      await this.getAndUpdateTokenBalance(toToken);
    } else {
      await Promise.all([
        this.getAndUpdateTokenBalance(fromToken),
        this.getAndUpdateTokenBalance(toToken),
        this.getAndUpdateTokenBalance({
          address: Web3Pure.getNativeTokenAddress(chainType),
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
    const web3Pure = Web3Pure.getInstance(fromChainType);

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

  private async fetchT1Balances(
    address: string,
    chainType: ChainType,
    chains: BlockchainName[]
  ): Promise<boolean> {
    if (chainType !== CHAIN_TYPE.EVM) {
      return false;
    }
    const availableNetworks = chains.filter(chain => this.tokensStore.tokens?.[chain]);

    availableNetworks.forEach(chain => this.tokensStore.tokens[chain]._balanceLoading$.next(true));
    return new Promise(resolve => {
      this.apiService
        .getBackendBalances(address)
        .pipe(catchError(() => of(null)))
        .subscribe(el => {
          if (!el) {
            resolve(false);
          }
          Object.entries(el)
            .filter(
              ([chain]: [BlockchainName, BackendBalanceToken[]]) => this.tokensStore.tokens?.[chain]
            )
            .forEach(([blockchain, tokens]) => {
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

  public async fetchDifferentChainsBalances(tokens: Token[]): Promise<BalanceToken[]> {
    const chainTokens: Partial<Record<BlockchainName, Token[]>> = {};
    tokens.forEach(token => {
      if (!chainTokens[token.blockchain]) {
        chainTokens[token.blockchain] = [];
      }
      chainTokens[token.blockchain].push(token);
    });
    const promises = Object.entries(chainTokens).map(([chain]: [BlockchainName, Token[]]) => {
      let adapter: AbstractAdapter<unknown, unknown, BlockchainName>;
      try {
        adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(chain as RubicAny);
      } catch {
        return Promise.resolve(
          tokens.map(token => ({ ...token, favorite: false, amount: new BigNumber(NaN) }))
        );
      }
      return firstValueFrom(
        this.tokensStore.tokens[chain].pageLoading$.pipe(first(loading => loading === false))
      ).then(() => {
        this.tokensStore.tokens[chain]._balanceLoading$.next(true);
        const tokensObject = this.collectionsFacade.blockchainTokens[chain].getTokens();
        const tokensState = Object.values(tokensObject).map(token => token.address);

        return adapter
          .getTokensBalances(this.authService.userAddress, tokensState)
          .catch(() => tokensState.map(() => new BigNumber(NaN)))
          .then(balances => {
            const tokensWithBalances = Object.values(tokensObject).map((token, idx) => ({
              ...token,
              amount: balances?.[idx]?.gt(0)
                ? OldToken.fromWei(balances[idx], token.decimals)
                : new BigNumber(NaN)
            })) as BalanceToken[];
            const tokensWithNotNullBalance = tokensWithBalances.filter(t => !t.amount.isNaN());

            this.tokensStore.addBlockchainBalanceTokens(chain, tokensWithNotNullBalance);
            this.tokensStore.tokens[chain]._balanceLoading$.next(false);

            return tokensWithBalances;
          });
      });
    });
    const tokensWithBalances = await Promise.all(promises);
    return tokensWithBalances.flat().sort(sorterByTokenRank);
  }

  private async fetchListBalances(
    address: string,
    chainType: ChainType,
    chains: BlockchainName[]
  ): Promise<void> {
    const resultChains = chains.filter(
      (chain: BlockchainName) => chainType === BlockchainsInfo.getChainType(chain)
    );

    return new Promise(resolve => {
      resultChains.forEach((chain, index) => {
        const adapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(chain as RubicAny);
        firstValueFrom(
          this.tokensStore.tokens[chain].pageLoading$.pipe(first(loading => loading === false))
        ).then(() => {
          this.tokensStore.tokens[chain]._balanceLoading$.next(true);
          const tokensObject = this.collectionsFacade.blockchainTokens[chain].getTokens();
          const tokens = Object.values(tokensObject).map(token => token.address);

          adapter
            .getTokensBalances(address, tokens)
            .catch(() => tokens.map(() => new BigNumber(NaN)))
            .then(balances => {
              const tokensWithBalances = Object.values(tokensObject).map((token, idx) => ({
                ...token,
                amount: balances?.[idx]?.gt(0)
                  ? OldToken.fromWei(balances[idx], token.decimals)
                  : new BigNumber(NaN)
              })) as BalanceToken[];
              const tokensWithNotNullBalance = tokensWithBalances.filter(t => !t.amount.isNaN());

              this.tokensStore.addBlockchainBalanceTokens(chain, tokensWithNotNullBalance);
              this.tokensStore.tokens[chain]._balanceLoading$.next(false);

              if (chains.length === index + 1) {
                resolve();
              }
            });
        });
      });
    });
  }

  private async fetchT2Balances(
    address: string,
    type: ChainType,
    availableNetworks: BlockchainName[]
  ): Promise<void> {
    const blChains: BlockchainName[] = Object.values(TEST_EVM_BLOCKCHAIN_NAME);

    const chains = Object.values(BLOCKCHAIN_NAME).filter(
      (chain: BlockchainName) =>
        !availableNetworks.includes(chain) &&
        !blChains.includes(chain) &&
        type === BlockchainsInfo.getChainType(chain)
    );

    return this.fetchListBalances(address, type, chains);
  }

  public async fetchTokenBalance(
    tokenAddress: string,
    blockchain: BlockchainName
  ): Promise<BalanceToken> {
    const foundToken = this.findTokenSync({ address: tokenAddress, blockchain });
    const blockchainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
      BLOCKCHAIN_NAME.ARBITRUM
    );

    const chainBalancesPromise = blockchainAdapter
      .getBalance(this.authService.userAddress, tokenAddress)
      .catch(() => new BigNumber(NaN));
    //
    return chainBalancesPromise.then(balance => {
      return { ...foundToken, amount: OldToken.fromWei(balance, foundToken.decimals) };
    });
  }

  public async updateParticipantTokens(): Promise<void> {
    const fromToken = this.formService.inputValue?.fromToken;
    const toToken = this.formService.inputValue?.toToken;
    const nativeToken = nativeTokensList?.[fromToken?.blockchain];

    await Promise.all([
      ...(fromToken ? [this.getAndUpdateTokenBalance(fromToken)] : []),
      ...(toToken ? [this.getAndUpdateTokenBalance(toToken)] : []),
      ...(nativeToken && !compareTokens(nativeToken, fromToken)
        ? [this.getAndUpdateTokenBalance(nativeToken)]
        : [])
    ]);
  }

  public subscribeOnWallet(): void {
    this.authService.currentUser$
      .pipe(
        distinctUntilChanged((oldValue, newValue) =>
          compareAddresses(oldValue?.address, newValue?.address)
        ),
        combineLatestWith(
          this.configService.balanceNetworks$.pipe(first(el => Boolean(el?.length)))
        )
      )
      .subscribe(([user, balanceNetworks]) => {
        if (user?.address) {
          this.collectionsFacade.allTokens.setBalanceLoading(true);
          Promise.all([
            this.fetchT1Balances(user.address, user.chainType, balanceNetworks),
            this.fetchT2Balances(user.address, user.chainType, balanceNetworks)
          ]).then(([successT1request]) => {
            if (!successT1request) {
              this.fetchListBalances(user.address, user.chainType, balanceNetworks).then(() => {
                this.collectionsFacade.allTokens.setBalanceLoading(false);
              });
            }
            this.collectionsFacade.allTokens.setBalanceLoading(false);
          });
        } else {
          this.tokensStore.clearAllBalances();
        }
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

  private subscribeOnFormTokens(): void {
    let fromInterval: NodeJS.Timeout;
    let toInterval: NodeJS.Timeout;

    this.formService.fromToken$
      .pipe(debounceTime(200), distinctObjectUntilChanged())
      .subscribe(fromToken => {
        // fromInterval.clear
        clearInterval(fromInterval);
        if (fromToken) {
          fromInterval = setInterval(() => {
            this.getAndUpdateTokenBalance(fromToken);
          }, 30_000);
        }
      });

    this.formService.toToken$
      .pipe(debounceTime(200), distinctObjectUntilChanged())
      .subscribe(toToken => {
        clearInterval(toInterval);
        if (toToken) {
          toInterval = setInterval(() => {
            this.getAndUpdateTokenBalance(toToken);
          }, 30_000);
        }
      });
  }
}
