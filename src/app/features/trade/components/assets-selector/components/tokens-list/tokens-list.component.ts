import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { LIST_ANIMATION } from '@features/trade/components/assets-selector/animations/list-animation';
import { TokensListService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list.service';
import { TokensListStoreService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-store.service';
import { MobileNativeModalService } from '@app/core/modals/services/mobile-native-modal.service';
import { AssetsSelectorService } from '../../services/assets-selector-service/assets-selector.service';

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

  public readonly tokensToShow$ = this.tokensListStoreService.tokensToShow$;

  constructor(
    private readonly tokensListService: TokensListService,
    private readonly tokensListStoreService: TokensListStoreService,
    private readonly mobileNativeService: MobileNativeModalService,
    private readonly assetsSelectorService: AssetsSelectorService
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
}
