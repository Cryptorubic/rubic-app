import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { SwapFormService } from '@features/swaps/core/services/swap-form-service/swap-form.service';
import { first, map, pairwise, startWith, switchMap } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SWAP_PROVIDER_TYPE } from '@features/swaps/features/swap-form/models/swap-provider-type';
import { SwapFormInput } from '../swap-form-service/models/swap-form-controls';
import { isMinimalToken } from '@shared/utils/is-token';
import { compareAssets } from '@features/swaps/shared/utils/compare-assets';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { BlockchainName, BlockchainsInfo, CHAIN_TYPE, EvmWeb3Pure, Web3Pure } from 'rubic-sdk';
import BigNumber from 'bignumber.js';
import { List } from 'immutable';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import {
  defaultFormParameters,
  DefaultParametersFrom,
  DefaultParametersTo
} from '@features/swaps/core/services/swaps-service/constants/default-form-parameters';
import { compareAddresses, switchIif } from '@shared/utils/utils';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Injectable()
export class SwapsService {
  private intervalId: NodeJS.Timeout;

  private readonly _swapProviderType$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  public readonly swapMode$ = this._swapProviderType$.asObservable();

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProviderType$.getValue();
  }

  set swapMode(swapType: SWAP_PROVIDER_TYPE) {
    this._swapProviderType$.next(swapType);
  }

  private readonly _initialLoading$ = new BehaviorSubject<boolean>(true);

  public readonly initialLoading$ = this._initialLoading$.asObservable();

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly queryParamsService: QueryParamsService,
    private readonly tokensService: TokensService,
    private readonly gtmService: GoogleTagManagerService
  ) {
    this.subscribeOnQueryParams();
    this.subscribeOnForm();
  }

  private subscribeOnQueryParams(): void {
    this.queryParamsService.queryParams$
      .pipe(
        first(Boolean),
        switchMap(queryParams =>
          this.tokensService.tokens$.pipe(
            first(Boolean),
            map(tokens => ({ queryParams, tokens }))
          )
        ),
        switchMap(({ queryParams, tokens }) => {
          const protectedParams = this.getProtectedSwapParams(queryParams);

          const fromAssetType = protectedParams.fromChain;
          const toBlockchain = protectedParams.toChain;

          const findFromToken$ = BlockchainsInfo.isBlockchainName(fromAssetType)
            ? this.getTokenBySymbolOrAddress(tokens, protectedParams?.from, fromAssetType)
            : of(null);
          const findToToken$ = this.getTokenBySymbolOrAddress(
            tokens,
            protectedParams?.to,
            toBlockchain
          );

          return forkJoin([findFromToken$, findToToken$]).pipe(
            map(([fromToken, toToken]) => ({
              fromAsset: fromToken,
              toToken,
              fromAssetType,
              toBlockchain,
              protectedParams
            }))
          );
        })
      )
      .subscribe(({ fromAsset, toToken, fromAssetType, toBlockchain, protectedParams }) => {
        this.gtmService.needTrackFormEventsNow = false;
        this.swapFormService.inputControl.patchValue({
          fromAssetType,
          toBlockchain,
          ...(fromAsset && { fromAsset }),
          ...(toToken && { toToken }),
          ...(protectedParams.amount && { fromAmount: new BigNumber(protectedParams.amount) })
        });
        this._initialLoading$.next(false);
      });
  }

  private getProtectedSwapParams(queryParams: QueryParams): QueryParams {
    const fromChain =
      BlockchainsInfo.isBlockchainName(queryParams.fromChain) || queryParams.fromChain === 'fiat'
        ? queryParams.fromChain
        : defaultFormParameters.swap.fromChain;

    const toChain = BlockchainsInfo.isBlockchainName(queryParams?.toChain)
      ? queryParams.toChain
      : defaultFormParameters.swap.toChain;

    const newParams = {
      ...queryParams,
      fromChain,
      toChain,
      ...(queryParams.from && { from: queryParams.from }),
      ...(queryParams.to && { to: queryParams.to }),
      ...(queryParams.amount && { amount: queryParams.amount })
    };

    if (fromChain === toChain && newParams.from && newParams.from === newParams.to) {
      if (newParams.from === defaultFormParameters.swap.from[fromChain as DefaultParametersFrom]) {
        newParams.from = defaultFormParameters.swap.to[fromChain as DefaultParametersTo];
      } else {
        newParams.to = defaultFormParameters.swap.from[fromChain as DefaultParametersFrom];
      }
    }

    return newParams;
  }

  /**
   * Gets tokens by symbol or address.
   * @param tokens Tokens list to search.
   * @param token Tokens symbol or address.
   * @param chain Tokens chain.
   * @return Observable<TokenAmount> Founded token.
   */
  private getTokenBySymbolOrAddress(
    tokens: List<TokenAmount>,
    token: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    if (!token) {
      return of(null);
    }

    const chainType = BlockchainsInfo.getChainType(chain);
    if (Web3Pure[chainType].isAddressCorrect(token)) {
      const address = chainType === CHAIN_TYPE.EVM ? EvmWeb3Pure.toChecksumAddress(token) : token;
      return this.searchTokenByAddress(tokens, address, chain);
    }
    return this.searchTokenBySymbol(tokens, token, chain);
  }

  /**
   * Searches token by symbol.
   * @param tokens List of local tokens.
   * @param symbol Symbol to search.
   * @param chain Chain to search.
   * @return Observable<TokenAmount> Searched token.
   */
  private searchTokenBySymbol(
    tokens: List<TokenAmount>,
    symbol: string,
    chain: BlockchainName
  ): Observable<TokenAmount | null> {
    const similarTokens = tokens.filter(
      token =>
        token.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase() &&
        token.blockchain === chain
    );

    if (!similarTokens.size) {
      return this.tokensService.fetchQueryTokens(symbol, chain).pipe(
        map(foundTokens => {
          if (foundTokens?.size) {
            const token =
              foundTokens?.size > 1
                ? foundTokens.find(
                    el => el.symbol.toLocaleLowerCase() === symbol.toLocaleLowerCase()
                  )
                : foundTokens.first();
            const newToken = { ...token, amount: new BigNumber(NaN) };
            this.tokensService.addToken(newToken);
            return newToken;
          }
          return null;
        })
      );
    }

    return of(similarTokens.first());
  }

  /**
   * Searches token by address.
   * @param tokens List of local tokens.
   * @param address Address to search.
   * @param chain Chain to search.
   * @return Observable<TokenAmount> Searched token.
   */
  private searchTokenByAddress(
    tokens: List<TokenAmount>,
    address: string,
    chain: BlockchainName
  ): Observable<TokenAmount> {
    const searchingToken = tokens.find(
      token => compareAddresses(token.address, address) && token.blockchain === chain
    );

    return searchingToken
      ? of(searchingToken)
      : this.tokensService.fetchQueryTokens(address, chain).pipe(
          switchIif(
            backendTokens => Boolean(backendTokens?.size),
            backendTokens => of(backendTokens.first()),
            () => this.tokensService.addTokenByAddress(address, chain).pipe(first())
          ),
          map(fetchedToken => {
            const newToken = { ...fetchedToken, amount: new BigNumber(NaN) };
            this.tokensService.addToken(newToken);
            return newToken;
          })
        );
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValue$
      .pipe(startWith(null), pairwise())
      .subscribe(([prevForm, curForm]) => {
        this.setSwapProviderType(curForm);

        if (
          (!compareAssets(prevForm?.fromAsset, curForm.fromAsset) &&
            isMinimalToken(curForm.fromAsset)) ||
          (!TokensService.areTokensEqual(prevForm?.toToken, curForm.toToken) && curForm.toToken)
        ) {
          this.updateTokensPrices(curForm);
        }

        if (
          !compareAssets(prevForm?.fromAsset, curForm.fromAsset) &&
          isMinimalToken(curForm.fromAsset)
        ) {
          this.updateTokenBalance(curForm.fromAsset);
        }
      });
  }

  private setSwapProviderType(form: SwapFormInput): void {
    const { fromAssetType, toBlockchain } = form;

    if (fromAssetType === 'fiat') {
      this.swapMode = SWAP_PROVIDER_TYPE.ONRAMPER;
    } else if (!fromAssetType || !toBlockchain || fromAssetType === toBlockchain) {
      this.swapMode = SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else {
      this.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
    }
  }

  /**
   * Takes selected tokens from {@param form} and call functions to update their prices.
   * Sets interval to update prices.
   * @param form Input form, which contains selected tokens.
   */
  private updateTokensPrices(form: SwapFormInput): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    const update = () => {
      if (isMinimalToken(form?.fromAsset)) {
        this.tokensService.getAndUpdateTokenPrice(form.fromAsset);
      }
      if (form?.toToken) {
        this.tokensService.getAndUpdateTokenPrice(form.toToken);
      }
    };

    update();
    this.intervalId = setInterval(update, 15_000);
  }

  /**
   * Calls functions to update balance, if needed.
   */
  private updateTokenBalance(fromToken: TokenAmount): void {
    if (!fromToken.amount?.isFinite()) {
      this.tokensService.getAndUpdateTokenBalance(fromToken);
    }
  }
}
