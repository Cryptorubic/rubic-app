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
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
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
      // const toBlockchain = this.swapFormService.inputValue['toBlockchain'];
      // const toToken = this.swapFormService.inputValue.toToken;
      const currentBlockchain = this.assetsSelectorService.assetType;

      // Проверки для целевой сети при исходной METIS
      if (formType === 'to' && fromBlockchain === BLOCKCHAIN_NAME.METIS) {
        return this.getAvailableTokensForSwapFromSrcMetis(tokens, currentBlockchain, fromToken);
      }

      // Проверки для целевой сети METIS при исходной BSC / AVAX
      if (
        formType === 'to' &&
        currentBlockchain === BLOCKCHAIN_NAME.METIS &&
        (fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
          fromBlockchain === BLOCKCHAIN_NAME.AVALANCHE)
      ) {
        return [tokens.find(token => token.symbol.toLowerCase() === 'm.usdt')];
      }

      // Проверки для целевой сети METIS при исходной ETH
      if (
        formType === 'to' &&
        currentBlockchain === BLOCKCHAIN_NAME.METIS &&
        fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM
      ) {
        return tokens.filter(
          token => token.symbol.toLowerCase() === 'm.usdt' || token.symbol.toLowerCase() === 'metis'
        );
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
      currentBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
      currentBlockchain === BLOCKCHAIN_NAME.AVALANCHE
    ) {
      return [tokens.find(token => token.symbol.toLowerCase() === 'usdt')];
    }

    if (currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
      if (fromToken.symbol.toLowerCase() === 'metis') {
        return tokens.filter(
          token => token.symbol.toLowerCase() === 'usdt' || token.symbol.toLowerCase() === 'metis'
        );
      } else {
        return [tokens.find(token => token.symbol.toLowerCase() === 'usdt')];
      }
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
