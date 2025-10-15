import { Injectable } from '@angular/core';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { combineLatestWith, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { AssetsSelectorStateService } from '../assets-selector-state/assets-selector-state.service';
import {
  assertTokensNetworkStateKey,
  TokensNetworkStateKey
} from '@app/shared/models/tokens/paginated-tokens';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';

@Injectable()
export class TokensListService {
  public get loading(): boolean {
    // @TODO TOKENS
    return false;
  }

  constructor(
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly destroy$: TuiDestroyService,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {
    this.subscribeOnTokensToShow();
  }

  public setListScrollSubject(scroll: CdkVirtualScrollViewport): void {
    if (scroll) {
      this.listScrollSubject$.next(scroll);
    }
  }

  private resetScrollToTop(): void {
    if (this.listScrollSubject$.value) {
      this.listScrollSubject$.value.scrollToIndex(0);
    }
  }

  /**
   *
   */
  private getTokensNetworkStateKey(): TokensNetworkStateKey {
    assertTokensNetworkStateKey(this.assetsSelectorStateService.assetType);
    return this.assetsSelectorStateService.assetType;
  }

  private subscribeOnTokensToShow(): void {
    this.assetsSelectorFacade
      .getAssetsService(this.type)
      .assetType$.pipe(
        combineLatestWith(this.assetsSelectorStateService.tokenFilter$),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetScrollToTop();
        this.listAnimationType = 'hidden';
        setTimeout(() => {
          this.listAnimationType = 'shown';
        });
      });
  }
}
