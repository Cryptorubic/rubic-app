import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import {
  TokensSelectComponentContext,
  TokensSelectComponentInput
} from '@features/swaps/shared/components/tokens-select/models/tokens-select-polymorpheus-data';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';
import { map } from 'rxjs/operators';
import { TokensListService } from '@features/swaps/shared/components/tokens-select/services/tokens-list-service/tokens-list.service';

@Component({
  selector: 'polymorpheus-tokens-selector',
  templateUrl: './tokens-selector.component.html',
  styleUrls: ['./tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensSelectorComponent implements OnInit, OnDestroy {
  public idPrefix: string;

  public readonly iframeTokenSearch = this.iframeService.tokenSearch;

  public readonly searchLoading$ = this.tokensListService.searchLoading$;

  public readonly headerText$ = this.tokensSelectorService.listType$.pipe(
    map(listType => {
      if (listType === 'default') {
        return 'modals.tokensListModal.defaultTitle';
      }
      return 'modals.tokensListModal.favoriteTokensTitle';
    })
  );

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TokensSelectComponentContext,
    private readonly tokensService: TokensService,
    private readonly iframeService: IframeService,
    private readonly tokensSelectorService: TokensSelectorService,
    private readonly tokensListService: TokensListService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.initiateContextParams(context.data);

    this.tokensSelectorService.tokenSelected$.subscribe(selectedToken => {
      this.tokensService.addToken(selectedToken);
      this.context.completeWith(selectedToken);
    });
  }

  ngOnInit(): void {
    this.setWindowHeight();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  private initiateContextParams(context: TokensSelectComponentInput): void {
    this.idPrefix = context.idPrefix;
    this.tokensSelectorService.initParameters(context);
  }

  /**
   * Sets window height through html class name, to prevent broken scroll in Safari.
   */
  private setWindowHeight(): void {
    this.document.documentElement.style.setProperty(
      '--window-inner-height',
      `${window.innerHeight}px`
    );
    this.document.documentElement.classList.add('is-locked');
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }
}
