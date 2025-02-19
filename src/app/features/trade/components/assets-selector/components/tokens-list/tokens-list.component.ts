import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { switchMap } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { BlockchainsInfo, EvmBlockchainName, Web3Pure, wrappedNativeTokensList } from 'rubic-sdk';
import { compareAddresses } from '@app/shared/utils/utils';
import { STABLE_TOKENS_NAMES } from '../../constants/stable-tokens-names';
import { HeaderStore } from '@app/core/header/services/header.store';
import { QueryParamsService } from '@app/core/services/query-params/query-params.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';
import { BalanceLoadingStateService } from '@app/core/services/tokens/balance-loading-state.service';

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

  public readonly isMobile = this.headerStore.isMobile;

  public readonly isBalanceLoading$ = this.tokensListStoreService.tokensToShow$.pipe(
    switchMap(() =>
      this.balanceLoadingStateService.isBalanceLoading$(this.assetsSelectorStateService.assetType)
    )
  );

  public get showAll(): boolean {
    return this.assetsSelectorStateService.assetType === 'allChains';
  }

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$;

  public readonly useLargeIframe = this.queryParamsService.useLargeIframe;

  constructor(
    private readonly tokensListService: TokensListService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly headerStore: HeaderStore,
    private readonly queryParamsService: QueryParamsService,
    private readonly balanceLoadingStateService: BalanceLoadingStateService
  ) {}

  /**
   * Function to track list element by unique key: token blockchain and address.
   * @param _index Index of list element.
   * @param tokenListElement List element.
   * @return string Unique key for element.
   */
  public trackByFn(_index: number, tokenListElement: AvailableTokenAmount): string {
    return `${tokenListElement.blockchain}_${tokenListElement.address}`;
  }

  public onTokenSelect(token: AvailableTokenAmount): void {
    this.mobileNativeService.forceClose();

    if (token.available) {
      this.assetsSelectorService.onAssetSelect(token);
    }
  }

  public isGasExchangeableToken(t: AvailableTokenAmount): boolean {
    const chainType = BlockchainsInfo.getChainType(t.blockchain);
    const isNative = Web3Pure[chainType].isNativeAddress(t.address);
    const wrappedAddress = wrappedNativeTokensList[t.blockchain as EvmBlockchainName]?.address;
    const isWrapped = compareAddresses(wrappedAddress, t.address);
    const isStable = STABLE_TOKENS_NAMES.some(name => new RegExp(name, 'i').test(t.name));

    return isNative || isWrapped || isStable;
  }
}
