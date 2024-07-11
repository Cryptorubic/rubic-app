import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { combineLatestWith, map, of, switchMap } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';
import { FormsTogglerService } from '@app/features/trade/services/forms-toggler/forms-toggler.service';
import { MAIN_FORM_TYPE } from '@app/features/trade/services/forms-toggler/models';
import { BlockchainsInfo, EvmBlockchainName, Web3Pure, wrappedNativeTokensList } from 'rubic-sdk';
import { compareAddresses } from '@app/shared/utils/utils';
import { STABLE_TOKENS_NAMES } from '../../constants/stable-tokens-names';
import { HeaderStore } from '@app/core/header/services/header.store';

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
    switchMap(tokens => {
      if (!tokens.length) {
        return of(false);
      }
      return this.tokensListStoreService.isBalanceLoading$(tokens[0].blockchain);
    })
  );

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$.pipe(
    combineLatestWith(this.formsTogglerService.selectedForm$),
    map(([tokens, mainFormType]) => {
      if (mainFormType === MAIN_FORM_TYPE.GAS_FORM) {
        return tokens.filter(t => this.isGasExchangeableToken(t));
      }
      return tokens;
    })
  );

  constructor(
    private readonly tokensListService: TokensListService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly formsTogglerService: FormsTogglerService,
    private readonly headerStore: HeaderStore
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
