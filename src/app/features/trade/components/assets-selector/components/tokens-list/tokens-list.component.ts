import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { MobileNativeModalService } from '@core/modals/services/mobile-native-modal.service';
import { map } from 'rxjs/operators';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { BLOCKCHAIN_NAME, BlockchainName } from 'rubic-sdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { AssetType } from '@features/trade/models/asset';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [LIST_ANIMATION]
})
export class TokensListComponent {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.tokensListService.setListScrollSubject(scroll);
  }

  public readonly loading$ = this.tokensListService.loading$;

  public readonly listAnimationState$ = this.tokensListService.listAnimationType$;

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$;

  public readonly customToken$ = this.tokensListStoreService.customToken$;

  public readonly isBalanceLoading$ = this.tokensListStoreService.tokensToShow$.pipe(
    switchMap(tokens => {
      if (!tokens.length) {
        return of(false);
      }
      return this.tokensListStoreService.isBalanceLoading$(tokens[0].blockchain);
    })
  );

  private readonly _metisText$ = new BehaviorSubject<string>('');

  public readonly metisText$ = this._metisText$.asObservable();

  public readonly newTokensToShow$ = this.tokensToShow$.pipe(
    map(tokens => {
      const formType = this.assetsSelectorService.formType;
      const fromBlockchain = this.swapFormService.inputValue['fromBlockchain'];
      const fromToken = this.swapFormService.inputValue.fromToken;
      const toBlockchain = this.swapFormService.inputValue['toBlockchain'];
      const toToken = this.swapFormService.inputValue.toToken;
      const currentBlockchain = this.assetsSelectorService.assetType;

      // Проверки для целевой сети
      if (formType === 'to' && fromBlockchain === BLOCKCHAIN_NAME.METIS) {
        return this.dstChainTokensCheck(tokens, fromBlockchain, fromToken, currentBlockchain);
      }

      // Проверки для исходной сети
      if (formType === 'from' && toBlockchain === BLOCKCHAIN_NAME.METIS) {
        return this.srcChainTokensCheck(tokens, toBlockchain, toToken, currentBlockchain);
      }

      return tokens;
    })
  );

  constructor(
    private readonly queryParamsService: QueryParamsService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly swapFormService: SwapsFormService,
    private readonly tokensListService: TokensListService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly mobileNativeService: MobileNativeModalService
  ) {}

  // eslint-disable-next-line complexity
  public srcChainTokensCheck(
    tokens: AvailableTokenAmount[],
    toBlockchain: BlockchainName,
    toToken: TokenAmount,
    currentBlockchain: AssetType
  ): AvailableTokenAmount[] {
    if (
      (toBlockchain !== BLOCKCHAIN_NAME.METIS &&
        toBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        toBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
        toBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) ||
      (toToken &&
        toBlockchain === BLOCKCHAIN_NAME.METIS &&
        currentBlockchain !== BLOCKCHAIN_NAME.METIS &&
        currentBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        currentBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
        currentBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN)
    ) {
      this._metisText$.next('Swaps from Metis are not available to the selected network');
      return [];
    }

    if (toBlockchain === BLOCKCHAIN_NAME.METIS && toToken?.symbol.toLowerCase() === 'metis') {
      if (currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
        return tokens;
      }
    }

    if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM && toToken?.symbol.toLowerCase() === 'metis') {
      return [tokens.find(token => token.symbol.toLowerCase() === 'metis')];
    }

    if (
      currentBlockchain !== BLOCKCHAIN_NAME.METIS ||
      toBlockchain === BLOCKCHAIN_NAME.ETHEREUM ||
      toBlockchain === BLOCKCHAIN_NAME.AVALANCHE ||
      toBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
    ) {
      if (toToken) {
        if (toToken.symbol.toLowerCase() === 'usdt' || toToken.symbol.toLowerCase() === 'm.usdt') {
          return tokens;
        } else {
          this._metisText$.next(
            'Select USDT on the target network as other tokens are not supported'
          );
          return [];
        }
      }
    }

    return tokens;
  }

  public dstChainTokensCheck(
    tokens: AvailableTokenAmount[],
    fromBlockchain: BlockchainName,
    fromToken: TokenAmount,
    currentBlockchain: AssetType
  ): AvailableTokenAmount[] {
    if (fromBlockchain === BLOCKCHAIN_NAME.METIS) {
      return this.getAvailableTokensForSwapFromSrcMetis(tokens, currentBlockchain, fromToken);
    }

    if (currentBlockchain === BLOCKCHAIN_NAME.METIS) {
      if (
        fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
        fromBlockchain === BLOCKCHAIN_NAME.AVALANCHE
      ) {
        return [tokens.find(token => token.symbol.toLowerCase() === 'm.usdt')];
      }

      if (fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
        return tokens.filter(
          token => token.symbol.toLowerCase() === 'm.usdt' || token.symbol.toLowerCase() === 'metis'
        );
      }
    }

    return tokens;
  }

  private getAvailableTokensForSwapFromSrcMetis(
    tokens: AvailableTokenAmount[],
    currentBlockchain: AssetType,
    fromToken: TokenAmount
  ): AvailableTokenAmount[] {
    if (
      currentBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      currentBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
      currentBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
      currentBlockchain !== BLOCKCHAIN_NAME.METIS
    ) {
      this._metisText$.next(
        'From the selected network swaps are available only in BNB, Avalanche and Ethereum'
      );
      return [];
    }

    if (
      currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
      fromToken?.symbol.toLowerCase() === 'metis'
    ) {
      return tokens.filter(
        token => token.symbol.toLowerCase() === 'usdt' || token.symbol.toLowerCase() === 'metis'
      );
    }

    if (
      currentBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
      currentBlockchain === BLOCKCHAIN_NAME.AVALANCHE ||
      currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM
    ) {
      return [tokens.find(token => token.symbol.toLowerCase() === 'usdt')];
    }

    return tokens;
  }

  /**
   * Function to track list element by unique key: token blockchain and address.
   * @param _index Index of list element.
   * @param tokenListElement List element.
   * @return string Unique key for element.
   */
  public trackByFn(_index: number, tokenListElement: AvailableTokenAmount): string {
    return `${tokenListElement.blockchain}_${tokenListElement.address}`;
  }

  /**
   * Selects token.
   * @param token Selected token.
   */
  public onTokenSelect(token: AvailableTokenAmount): void {
    this.mobileNativeService.forceClose();

    if (token.available) {
      this.assetsSelectorService.onAssetSelect(token);
    }
  }
}
