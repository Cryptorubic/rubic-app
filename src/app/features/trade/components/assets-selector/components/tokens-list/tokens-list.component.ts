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
import { NATIVE_TOKEN_ADDRESS } from '@shared/constants/blockchain/native-token-address';

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

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$.pipe(
    map(tokens => {
      const formType = this.assetsSelectorService.formType;
      const fromBlockchain = this.swapFormService.inputValue['fromBlockchain'];
      const fromToken = this.swapFormService.inputValue.fromToken;
      const toBlockchain = this.swapFormService.inputValue['toBlockchain'];
      const toToken = this.swapFormService.inputValue.toToken;
      const currentBlockchain = this.assetsSelectorService.assetType;

      // Проверки для исходной сети
      if (formType === 'from') {
        return this.srcChainTokensCheck(
          tokens,
          toBlockchain,
          fromToken,
          toToken,
          currentBlockchain
        );
      }

      // Проверки для целевой сети
      if (formType === 'to') {
        return this.dstChainTokensCheck(
          tokens,
          fromBlockchain,
          fromToken,
          toToken,
          currentBlockchain
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

  // eslint-disable-next-line complexity
  public srcChainTokensCheck(
    tokens: AvailableTokenAmount[],
    toBlockchain: BlockchainName,
    fromToken: TokenAmount,
    toToken: TokenAmount,
    currentBlockchain: AssetType
  ): AvailableTokenAmount[] {
    if (!fromToken && !toToken) {
      return tokens;
    }

    if (currentBlockchain !== BLOCKCHAIN_NAME.METIS) {
      // Свап в Metis
      if (toBlockchain === BLOCKCHAIN_NAME.METIS) {
        // Свап в Metis из неподходящей сети
        if (
          currentBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
          currentBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
          currentBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        ) {
          this._metisText$.next(
            'Cross-chain swaps to the Metis network can only be initiated from Ethereum, BNB Chain, and Avalanche.'
          );
          return [];
        }

        // Свап в Metis (metis) из ETH (любой токен, кроме нативки)
        if (
          currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          toToken?.symbol.toLowerCase() === 'metis'
        ) {
          return tokens.filter(token => token.address !== NATIVE_TOKEN_ADDRESS);
        }

        // Свап в Metis из подходящей сети
        if (
          currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM ||
          currentBlockchain === BLOCKCHAIN_NAME.AVALANCHE ||
          currentBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
        ) {
          // Свап в Metis (usdt) из подходящей сети (любой токен, кроме нативки)
          if (toToken?.symbol.toLowerCase() === 'm.usdt') {
            return tokens.filter(token => token.address !== NATIVE_TOKEN_ADDRESS);
          } else {
            // Свап в Metis (любой токен кроме usdt) из подходящей сети (любой токен)
            this._metisText$.next(
              'The chosen token is not supported. Please choose USDT as the token in the target network.'
            );
            return [];
          }
        }
      }
    }

    if (currentBlockchain === BLOCKCHAIN_NAME.METIS) {
      // Свап из Metis в Metis
      if (toBlockchain === BLOCKCHAIN_NAME.METIS) {
        return tokens;
      }

      // Свап из Metis в неподходящие сети
      if (
        toBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
        toBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
        toBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
      ) {
        this._metisText$.next(
          'Cross-chain swaps from the Metis network are currently supported only to Ethereum, BNB Chain, and Avalanche.'
        );
        return [];
      }

      // Свап из Metis в подходящие сети
      if (
        toBlockchain === BLOCKCHAIN_NAME.ETHEREUM ||
        toBlockchain === BLOCKCHAIN_NAME.AVALANCHE ||
        toBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
      ) {
        // Свап в ETH (metis) только из Metis (metis)
        if (
          toBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
          toToken?.symbol.toLowerCase() === 'metis'
        ) {
          return [tokens.find(token => token.symbol.toLowerCase() === 'metis')];
        }

        // Свап в USDT из Metis (любой токен)
        if (
          toToken?.symbol.toLowerCase() === 'usdt' ||
          toToken?.symbol.toLowerCase() === 'm.usdt'
        ) {
          return tokens;
        }

        // Свап не в USDT из Metis (любой токен)
        if (toBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
          this._metisText$.next(
            'The chosen token is not supported. Please choose either USDT or Metis as the token in the target network.'
          );
          return [];
        } else {
          this._metisText$.next(
            'The chosen token is not supported. Please choose USDT as the token in the target network.'
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
    toToken: TokenAmount,
    currentBlockchain: AssetType
  ): AvailableTokenAmount[] {
    if (!fromToken && !toToken) {
      return tokens;
    }

    // Свап из Metis в другие сети
    if (fromBlockchain === BLOCKCHAIN_NAME.METIS) {
      return this.getAvailableTokensForSwapFromSrcMetis(tokens, currentBlockchain, fromToken);
    }

    // Свап из подходящих сетей в Metis
    if (currentBlockchain === BLOCKCHAIN_NAME.METIS) {
      if (fromToken?.address === NATIVE_TOKEN_ADDRESS) {
        this._metisText$.next(
          'Cross-chain swaps to the Metis network cannot be initiated from the native token. Please choose another token.'
        );
        return [];
      }

      // Свап из подходящих сетей (любой токен) в Metis (m.usdt)
      if (
        fromToken &&
        (fromBlockchain === BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN ||
          fromBlockchain === BLOCKCHAIN_NAME.AVALANCHE)
      ) {
        return [tokens.find(token => token.symbol.toLowerCase() === 'm.usdt')];
      }

      // Свап из ETH (любой токен) в Metis (m.usdt / metis)
      if (fromToken && fromBlockchain === BLOCKCHAIN_NAME.ETHEREUM) {
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
    // Свап из Metis в неподходящие сети
    if (
      currentBlockchain !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN &&
      currentBlockchain !== BLOCKCHAIN_NAME.AVALANCHE &&
      currentBlockchain !== BLOCKCHAIN_NAME.ETHEREUM &&
      currentBlockchain !== BLOCKCHAIN_NAME.METIS
    ) {
      this._metisText$.next(
        'Cross-chain swaps from the Metis network are currently supported only to Ethereum, BNB Chain, and Avalanche.'
      );
      return [];
    }

    // Свап из Metis (metis) в ETH (metis / usdt)
    if (
      currentBlockchain === BLOCKCHAIN_NAME.ETHEREUM &&
      fromToken?.symbol.toLowerCase() === 'metis'
    ) {
      return tokens.filter(
        token => token.symbol.toLowerCase() === 'usdt' || token.symbol.toLowerCase() === 'metis'
      );
    }

    // Свап из Metis (любой токен) в подходящие сети (usdt)
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
