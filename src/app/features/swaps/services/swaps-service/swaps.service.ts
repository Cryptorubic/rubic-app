import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { BridgeTokenPairsByBlockchains } from 'src/app/features/bridge/models/BridgeTokenPairsByBlockchains';
import { filter, first, pairwise, startWith } from 'rxjs/operators';
import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import BigNumber from 'bignumber.js';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { BridgeToken, BridgeTokenPair } from 'src/app/features/bridge/models/BridgeTokenPair';
import { TokenAmount } from 'src/app/shared/models/tokens/TokenAmount';
import { List } from 'immutable';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { compareAddresses, compareTokens } from 'src/app/shared/utils/utils';
import { SWAP_PROVIDER_TYPE } from '../../models/SwapProviderType';

@Injectable()
export class SwapsService {
  private _swapProviderType$ = new BehaviorSubject<SWAP_PROVIDER_TYPE>(undefined);

  private _availableTokens$ = new BehaviorSubject<List<TokenAmount>>(undefined);

  private _availableFavoriteTokens$ = new BehaviorSubject<List<TokenAmount>>(undefined);

  private _bridgeTokenPairsByBlockchainsArray$ = new BehaviorSubject<
    List<BridgeTokenPairsByBlockchains>
  >(undefined);

  private _bridgeTokenPairsByBlockchainsFavoriteArray$ = new BehaviorSubject<
    List<BridgeTokenPairsByBlockchains>
  >(undefined);

  private intervalId: NodeJS.Timeout;

  get availableTokens$(): Observable<List<TokenAmount>> {
    return this._availableTokens$.asObservable();
  }

  get availableFavoriteTokens$(): Observable<List<TokenAmount>> {
    return this._availableFavoriteTokens$.asObservable();
  }

  get bridgeTokenPairsByBlockchainsArray$(): Observable<List<BridgeTokenPairsByBlockchains>> {
    return this._bridgeTokenPairsByBlockchainsArray$.asObservable();
  }

  get bridgeTokenPairsByBlockchainsFavoriteArray$(): Observable<
    List<BridgeTokenPairsByBlockchains>
  > {
    return this._bridgeTokenPairsByBlockchainsFavoriteArray$.asObservable();
  }

  get swapMode$(): Observable<SWAP_PROVIDER_TYPE | null> {
    return this._swapProviderType$.asObservable();
  }

  get swapMode(): SWAP_PROVIDER_TYPE | null {
    return this._swapProviderType$.getValue();
  }

  set swapMode(swapType: SWAP_PROVIDER_TYPE) {
    this._swapProviderType$.next(swapType);
  }

  constructor(
    private readonly swapFormService: SwapFormService,
    private readonly bridgeService: BridgeService,
    private readonly tokensService: TokensService,
    private readonly iframeService: IframeService
  ) {
    this.subscribeOnTokens();
    this.subscribeOnForm();
  }

  private subscribeOnTokens(): void {
    combineLatest([
      this.bridgeService.tokens$.pipe(filter(tokens => !!tokens.length)),
      this.tokensService.tokens$.pipe(filter(tokens => !!tokens.size)),
      this.tokensService.favoriteTokens$
    ]).subscribe(([bridgeTokenPairsByBlockchainsArray, tokenAmounts, favoriteTokenAmounts]) => {
      const updatedTokenAmounts = tokenAmounts.toArray();
      const updatedFavoriteTokenAmounts = favoriteTokenAmounts.toArray();

      const updatedBridgeTokenPairsByBlockchainsArray =
        this.getBridgePairsArrayAndModifyTokensAmount(
          bridgeTokenPairsByBlockchainsArray,
          tokenAmounts,
          updatedTokenAmounts
        );

      const updatedBridgeFavoriteTokenPairsByBlockchainsArray =
        this.getBridgePairsArrayAndModifyTokensAmount(
          bridgeTokenPairsByBlockchainsArray,
          favoriteTokenAmounts,
          updatedFavoriteTokenAmounts
        );

      // filter and remove bridge specific tokens in widget
      updatedBridgeTokenPairsByBlockchainsArray.forEach(
        item =>
          (item.tokenPairs = item.tokenPairs.filter(pair =>
            Object.values(pair.tokenByBlockchain).every(bridgeToken => bridgeToken)
          ))
      );
      updatedBridgeFavoriteTokenPairsByBlockchainsArray.forEach(
        item =>
          (item.tokenPairs = item.tokenPairs.filter(pair =>
            Object.values(pair.tokenByBlockchain).every(bridgeToken => bridgeToken)
          ))
      );

      this._bridgeTokenPairsByBlockchainsArray$.next(
        List(updatedBridgeTokenPairsByBlockchainsArray)
      );
      this._bridgeTokenPairsByBlockchainsFavoriteArray$.next(
        List(updatedBridgeFavoriteTokenPairsByBlockchainsArray)
      );

      this._availableTokens$.next(List(updatedTokenAmounts));

      const availableFavoriteTokens = List(
        updatedFavoriteTokenAmounts.filter(tokenA =>
          favoriteTokenAmounts.some(tokenB => compareTokens(tokenA, tokenB))
        )
      );
      this._availableFavoriteTokens$.next(availableFavoriteTokens);
    });
  }

  /**
   * Gets bridge token pairs array for specific tokens list and modify tokens amounts list.
   * @param pairsArray Token pairs array.
   * @param tokenAmounts List of old tokens.
   * @param updatedTokenAmounts List of new tokens.
   * @private
   */
  private getBridgePairsArrayAndModifyTokensAmount(
    pairsArray: BridgeTokenPairsByBlockchains[],
    tokenAmounts: List<TokenAmount>,
    updatedTokenAmounts: TokenAmount[]
  ): BridgeTokenPairsByBlockchains[] {
    return pairsArray.map(tokenPairsByBlockchains => {
      const { fromBlockchain, toBlockchain } = tokenPairsByBlockchains;
      return {
        ...tokenPairsByBlockchains,
        tokenPairs: tokenPairsByBlockchains.tokenPairs.map(tokenPair => ({
          ...tokenPair,
          tokenByBlockchain: {
            [fromBlockchain]: this.getUpdatedBridgeToken(
              fromBlockchain,
              tokenPair,
              tokenAmounts,
              updatedTokenAmounts
            ),
            [toBlockchain]: this.getUpdatedBridgeToken(
              toBlockchain,
              tokenPair,
              tokenAmounts,
              updatedTokenAmounts
            )
          }
        }))
      };
    });
  }

  private subscribeOnForm(): void {
    this.swapFormService.inputValueChanges
      .pipe(startWith(null, this.swapFormService.inputValue), pairwise())
      .subscribe(([prevForm, curForm]) => {
        this.setSwapProviderType(curForm);

        if (
          (!TokensService.areTokensEqual(prevForm?.fromToken, curForm.fromToken) &&
            curForm.fromToken) ||
          (!TokensService.areTokensEqual(prevForm?.toToken, curForm.toToken) && curForm.toToken)
        ) {
          this.updateTokensPrices(curForm);
        }

        if (
          !TokensService.areTokensEqual(prevForm?.fromToken, curForm.fromToken) &&
          curForm.fromToken
        ) {
          this.updateTokenBalance(curForm.fromToken);
        }
      });
  }

  private setSwapProviderType(form: SwapFormInput): void {
    const { fromBlockchain, toBlockchain, fromToken, toToken } = form;

    if (fromBlockchain === toBlockchain) {
      this.swapMode = SWAP_PROVIDER_TYPE.INSTANT_TRADE;
    } else if (!fromToken || !toToken) {
      if (!this.swapMode || this.swapMode === SWAP_PROVIDER_TYPE.INSTANT_TRADE) {
        this.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
      }
    } else {
      this.bridgeTokenPairsByBlockchainsArray$
        .pipe(first())
        .subscribe(bridgeTokenPairsByBlockchainsArray => {
          const foundBridgeToken = bridgeTokenPairsByBlockchainsArray
            .find(
              tokenPairsByBlockchains =>
                tokenPairsByBlockchains.fromBlockchain === fromBlockchain &&
                tokenPairsByBlockchains.toBlockchain === toBlockchain
            )
            ?.tokenPairs.find(
              tokenPair =>
                compareAddresses(
                  tokenPair.tokenByBlockchain[fromBlockchain].address,
                  fromToken.address
                ) &&
                compareAddresses(tokenPair.tokenByBlockchain[toBlockchain].address, toToken.address)
            );

          if (foundBridgeToken) {
            this.swapMode = SWAP_PROVIDER_TYPE.BRIDGE;
          } else {
            this.swapMode = SWAP_PROVIDER_TYPE.CROSS_CHAIN_ROUTING;
          }
        });
    }
  }

  /**
   * Gets updated bridge token.
   * @param blockchain Current blockchain.
   * @param bridgeTokenPair Bridge token pair.
   * @param tokenAmounts Tokens list.
   * @param updatedTokenAmounts Updated Tokens list.
   * @return BridgeToken Updated token.
   */
  private getUpdatedBridgeToken(
    blockchain: BLOCKCHAIN_NAME,
    bridgeTokenPair: BridgeTokenPair,
    tokenAmounts: List<TokenAmount>,
    updatedTokenAmounts: TokenAmount[]
  ): BridgeToken {
    const bridgeToken = bridgeTokenPair.tokenByBlockchain[blockchain];
    const foundTokenAmount = tokenAmounts.find(
      tokenAmount =>
        tokenAmount.blockchain === blockchain &&
        compareAddresses(tokenAmount.address, bridgeToken.address)
    );

    if (
      !foundTokenAmount &&
      !updatedTokenAmounts.find(
        tokenAmount =>
          tokenAmount.blockchain === bridgeToken.blockchain &&
          compareAddresses(tokenAmount.address, bridgeToken.address)
      )
    ) {
      // don't add bridge specific tokens to widget tokens list
      if (this.iframeService.isIframe) {
        return null;
      }

      updatedTokenAmounts.push({
        ...bridgeToken,
        image: bridgeTokenPair.image,
        rank: 0,
        price: 0,
        usedInIframe: false,
        amount: new BigNumber(0),
        favorite: false
      });
    }

    return {
      ...foundTokenAmount,
      ...bridgeToken
    };
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
      if (form?.fromToken) {
        this.tokensService.getAndUpdateTokenPrice(form.fromToken);
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
