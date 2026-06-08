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
import { AbstractAdapter, waitFor, Web3Pure } from '@cryptorubic/web3';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  mergeMap,
  retry,
  switchMap
} from 'rxjs/operators';
import { defer, firstValueFrom, forkJoin, lastValueFrom, of, throwError, timer } from 'rxjs';
import { BackendBalanceToken } from '@core/services/backend/tokens-api/models/tokens';
import { Token } from '@shared/models/tokens/token';
import { BalanceToken } from '@shared/models/tokens/balance-token';
import { sorterByTokenRank } from '@features/trade/components/assets-selector/services/tokens-list-service/utils/sorters';
import { compareAddresses, compareTokens } from '@shared/utils/utils';
import { distinctObjectUntilChanged } from '@shared/utils/distinct-object-until-changed';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { NewTokensStoreService } from '@core/services/tokens/new-tokens-store.service';
import { NewTokensApiService } from '@core/services/tokens/new-tokens-api.service';
import { SdkLegacyService } from '@core/services/sdk/sdk-legacy/sdk-legacy.service';
import { PlatformConfigurationService } from '@core/services/backend/platform-configuration/platform-configuration.service';
import { TokensCollectionsFacadeService } from '@core/services/tokens/tokens-collections-facade.service';
import { MinimalToken } from '@shared/models/tokens/minimal-token';
import { getChainTypeSafe } from './utils/get-chain-type-safe';
import { WalletConnectorService } from '../wallets/wallet-connector-service/wallet-connector.service';
import { BalanceFetchingConfig } from './models/tokens-balance-service-types';
import { TotalBalancesStoreService } from './total-balances-store.service';
import { WalletChainType } from '@app/core/header/components/header/components/user-profile-wallets/constants/wallets-chain-types';

@Injectable({
  providedIn: 'root'
})
export class TokensBalanceService {
  private readonly formService = inject(SwapsFormService);

  // private readonly authService = inject(AuthService);

  private readonly tokensStore = inject(NewTokensStoreService);

  private readonly apiService = inject(NewTokensApiService);

  private readonly sdkLegacyService = inject(SdkLegacyService);

  private readonly configService = inject(PlatformConfigurationService);

  private readonly collectionsFacade = inject(TokensCollectionsFacadeService);

  private readonly walletConnectorService = inject(WalletConnectorService);

  private readonly totalBalancesStoreService = inject(TotalBalancesStoreService);

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

  // private get userAddress(): string | undefined {
  //   return this.authService.userAddress;
  // }

  public async waitForBalanceChangeAndCall<T>(
    token: {
      address: string;
      blockchain: BlockchainName;
    },
    prevBalanceWei: BigNumber,
    callback: () => Promise<T>,
    retryCount: number = 0,
    maxRetries: number = 5
  ): Promise<T> {
    try {
      const chainType = BlockchainsInfo.getChainType(token.blockchain);
      const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
      if (!walletAdapter) return;

      const blockchainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        token.blockchain as RubicAny
      );
      const balanceInWei = await blockchainAdapter.getBalance(walletAdapter.address, token.address);

      if (balanceInWei.eq(prevBalanceWei)) {
        if (retryCount <= maxRetries) {
          await waitFor(3_000);
          return this.waitForBalanceChangeAndCall(
            token,
            prevBalanceWei,
            callback,
            retryCount + 1,
            maxRetries
          );
        }
      }

      return callback();
    } catch (err) {
      console.error('[TokensBalanceService_waitForBalanceChangeAndCall] error: ', err);
      throw err;
    }
  }

  public async getAndUpdateTokenBalance(
    token: {
      address: string;
      blockchain: BlockchainName;
    },
    maxRetries: number = 0
  ): Promise<BigNumber> {
    let chainType = null;
    try {
      chainType = BlockchainsInfo.getChainType(token.blockchain);
    } catch {}
    if (!chainType) return new BigNumber(NaN);

    const _balanceLoading$ = this.tokensStore.tokens[token.blockchain]._balanceLoading$;
    const _tokensObject$ = this.tokensStore.tokens[token.blockchain]._tokensObject$;

    const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
    if (!walletAdapter) {
      const storedToken = this.findTokenSync(token);
      if (storedToken) {
        _tokensObject$.next({
          ..._tokensObject$.getValue(),
          [token.address]: { ...storedToken, amount: new BigNumber(NaN) }
        });
      }
      return new BigNumber(NaN);
    }

    const isAddressCorrectValue = await Web3Pure.isAddressCorrect(
      token.blockchain,
      walletAdapter.address
    );

    if (
      !chainType ||
      !isAddressCorrectValue
      // @TODO CHECK IF BLOCKCHAIN SUPPORTED
    ) {
      return new BigNumber(NaN);
    }

    try {
      _balanceLoading$.next(true);

      const blockchainAdapter = this.sdkLegacyService.adaptersFactoryService.getAdapter(
        token.blockchain as RubicAny
      );
      const balanceInWei = await lastValueFrom(
        defer(() => blockchainAdapter.getBalance(walletAdapter.address, token.address)).pipe(
          retry({
            count: maxRetries,
            delay: (error, retryCount) => {
              console.error('check balance error:', error, 'retry #', retryCount);
              // Tron Api too many requests error
              if (
                token.blockchain === BLOCKCHAIN_NAME.TRON &&
                error?.message?.includes('Request failed with status code 429')
              ) {
                return timer(5000);
              }
              return throwError(() => error);
            }
          })
        )
      );

      const storedToken = this.findTokenSync(token);
      if (!storedToken) return new BigNumber(NaN);

      const balance = OldToken.fromWei(balanceInWei, storedToken.decimals);
      if (storedToken && !storedToken.amount?.eq(balance)) {
        _tokensObject$.next({
          ..._tokensObject$.getValue(),
          [token.address]: { ...storedToken, amount: balance }
        });
      }

      return new BigNumber(balance);
    } catch (err) {
      console.debug(err);
      const storedToken = this.findTokenSync(token);
      return storedToken?.amount;
    } finally {
      _balanceLoading$.next(false);
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
    const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
    if (!walletAdapter) return;

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
    },
    fromTokenPrevBalanceWei: BigNumber,
    toTokenPrevBalanceWei: BigNumber
  ): Promise<void> {
    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
    if (!walletAdapter) return;

    const balancePromises = [
      this.waitForBalanceChangeAndCall(fromToken, fromTokenPrevBalanceWei, () =>
        this.getAndUpdateTokenBalance(fromToken)
      ),
      this.waitForBalanceChangeAndCall(toToken, toTokenPrevBalanceWei, () =>
        this.getAndUpdateTokenBalance(toToken)
      )
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

  public async fetchDifferentChainsBalances(
    tokens: Token[],
    balanceFetchingConfig: BalanceFetchingConfig,
    setBalanceLoading = true
  ): Promise<BalanceToken[]> {
    const chainTypes = this.walletConnectorService.chainTypes;
    const chainTokensMap: Partial<Record<BlockchainName, Token[]>> = {};
    tokens.forEach(token => {
      if (chainTypes.includes(getChainTypeSafe(token.blockchain))) {
        if (!chainTokensMap[token.blockchain]) {
          chainTokensMap[token.blockchain] = [];
        }
        chainTokensMap[token.blockchain].push(token);
      }
    });
    const promises = Object.entries(chainTokensMap).map(
      ([chain, chainTokens]: [BlockchainName, Token[]]) => {
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
          if (setBalanceLoading) {
            this.tokensStore.tokens[chain]._balanceLoading$.next(true);
          }
          const tokensAddresses = chainTokens.map(token => token.address);
          const chainType = BlockchainsInfo.getChainType(adapter.blockchain);
          const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
          const shouldFetchBalancesForWallet = balanceFetchingConfig.walletAddressesToFetch.some(
            walletAddrToFetch => compareAddresses(walletAddrToFetch, walletAdapter?.address)
          );

          if (!walletAdapter || !shouldFetchBalancesForWallet) {
            if (setBalanceLoading) {
              this.tokensStore.tokens[chain]._balanceLoading$.next(false);
            }
            return Promise.resolve(
              tokens.map(token => ({ ...token, favorite: false, amount: new BigNumber(NaN) }))
            );
          }

          return adapter
            .getTokensBalances(walletAdapter.address, tokensAddresses)
            .catch(() => tokensAddresses.map(() => new BigNumber(NaN)))
            .then(balances => {
              const tokensWithBalances = chainTokens.map((token, idx) => ({
                ...token,
                amount: balances?.[idx]?.gt(0)
                  ? OldToken.fromWei(balances[idx], token.decimals)
                  : new BigNumber(NaN)
              })) as BalanceToken[];
              const tokensWithNotNullBalance = tokensWithBalances.filter(t => !t.amount.isNaN());
              this.tokensStore.addBlockchainBalanceTokens(chain, tokensWithNotNullBalance);
              if (setBalanceLoading) {
                this.tokensStore.tokens[chain]._balanceLoading$.next(false);
              }
              return tokensWithBalances;
            });
        });
      }
    );
    const tokensWithBalances = await Promise.all(promises);
    return tokensWithBalances.flat().sort(sorterByTokenRank);
  }

  public async fetchListBalances(
    address: string,
    chainType: ChainType,
    chains: BlockchainName[]
  ): Promise<void> {
    const resultChains = chains.filter(
      (chain: BlockchainName) => chainType === getChainTypeSafe(chain)
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
    const chainType = BlockchainsInfo.getChainType(blockchain);
    const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });

    if (!walletAdapter) return foundToken;

    const chainBalancesPromise = blockchainAdapter
      .getBalance(walletAdapter.address, tokenAddress)
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

    const chainType = BlockchainsInfo.getChainType(fromToken.blockchain);
    const walletAdapter = this.walletConnectorService.getActiveProvider({ chainType });
    if (!walletAdapter) return;

    await Promise.all([
      ...(fromToken ? [this.getAndUpdateTokenBalance(fromToken)] : []),
      ...(toToken ? [this.getAndUpdateTokenBalance(toToken)] : []),
      ...(nativeToken && !compareTokens(nativeToken, fromToken)
        ? [this.getAndUpdateTokenBalance(nativeToken)]
        : [])
    ]);
  }

  // @TODO_530 проверить почему не очищаются балансы с октрытым селектором при отключении ЕВМ кошелька?
  // при отключении соланы и трона все работает правильно
  public subscribeOnWallet(): void {
    this.walletConnectorService.walletsManager.lastEvent$
      .pipe(
        mergeMap(lastEvent =>
          forkJoin([
            of(lastEvent),
            this.configService.balanceNetworks$.pipe(first(el => Boolean(el?.length)))
          ])
        )
      )
      .subscribe(([lastEvent, balanceNetworks]) => {
        switch (lastEvent.type) {
          case 'connected':
            this.collectionsFacade.allTokens.setBalanceLoading(true);
            const walletAddr = lastEvent.affectedWalletAddress;
            const chainType = lastEvent.affectedChainType;

            if (chainType === CHAIN_TYPE.EVM) {
              Promise.all([
                this.fetchT1Balances(walletAddr, chainType, balanceNetworks),
                this.fetchT2Balances(walletAddr, chainType, balanceNetworks)
              ])
                .then(([successT1request]) => {
                  if (!successT1request) {
                    return this.fetchListBalances(walletAddr, chainType, balanceNetworks);
                  }
                })
                .then(() =>
                  this.totalBalancesStoreService.calculateTotalBalanceByChain(CHAIN_TYPE.EVM)
                )
                .finally(() => this.collectionsFacade.allTokens.setBalanceLoading(false));
            } else {
              this.fetchT2Balances(walletAddr, chainType, balanceNetworks)
                .then(() =>
                  this.totalBalancesStoreService.calculateTotalBalanceByChain(
                    chainType as WalletChainType
                  )
                )
                .finally(() => {
                  this.collectionsFacade.allTokens.setBalanceLoading(false);
                });
            }

            break;
          case 'disconnected':
            const walletChainType = lastEvent.affectedChainType as WalletChainType;
            if (this.walletConnectorService.activeWallets.length > 0) {
              this.tokensStore.clearBalancesByChainType(walletChainType);
            } else {
              this.tokensStore.clearAllBalances();
            }
            this.totalBalancesStoreService.clearTotalBalanceByChain(walletChainType);
            break;
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
    let fromInterval: ReturnType<typeof setTimeout>;
    let toInterval: ReturnType<typeof setTimeout>;

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
