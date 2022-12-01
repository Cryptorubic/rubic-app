import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Self,
  ViewChild
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { IframeService } from '@core/services/iframe/iframe.service';
import { LIST_ANIMATION } from '@features/swaps/shared/components/tokens-select/components/tokens-list/animations/list-animation';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';
import { SearchQueryService } from '@features/swaps/shared/components/tokens-select/services/search-query-service/search-query.service';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [LIST_ANIMATION]
})
export class TokensListComponent {
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    this.tokensListService.setListScrollSubject(scroll);
  }

  public readonly tokensToShow$ = this.tokensListService.tokensToShow$;

  public readonly listAnimationState$ = this.tokensListService.listAnimationType$;

  public readonly customToken$ = this.tokensListService.customToken$;

  public readonly loading$ = this.tokensListService.loading$;

  public readonly rubicDomain = 'app.rubic.exchange';

  public get noFrameLink(): string {
    return `https://${this.rubicDomain}${this.queryParamsService.noFrameLink}`;
  }

  public readonly iframeRubicLink = this.iframeService.rubicLink;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensListService: TokensListService,
    private readonly searchQueryService: SearchQueryService,
    private readonly tokensService: TokensService,
    @Inject(WINDOW) private readonly window: RubicWindow
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

  /**
   * Selects token.
   * @param token Selected token.
   */
  public onTokenSelect(token: AvailableTokenAmount): void {
    if (token.available) {
      this.tokensSelectorService.onTokenSelect(token);
    }
  }
}
