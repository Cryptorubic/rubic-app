import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Self
} from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import { TokensService } from '@core/services/tokens/tokens.service';
import { TuiDestroyService, watch } from '@taiga-ui/cdk';
import { TokensNetworkState } from '@shared/models/tokens/paginated-tokens';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { IframeService } from '@core/services/iframe/iframe.service';
import {
  TokensSelectComponentContext,
  TokensSelectComponentInput
} from '@features/swaps/shared/components/tokens-select/models/tokens-select-polymorpheus-data';
import { TokensSelectorService } from '@features/swaps/shared/components/tokens-select/services/tokens-selector-service/tokens-selector.service';

@Component({
  selector: 'polymorpheus-tokens-selector',
  templateUrl: './tokens-selector.component.html',
  styleUrls: ['./tokens-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class TokensSelectorComponent implements OnInit, OnDestroy {
  public idPrefix: string;

  /**
   * Backend-api state of tokens in blockchains.
   */
  public tokensNetworkState: TokensNetworkState;

  public readonly iframeTokenSearch = this.iframeService.tokenSearch;

  public readonly searchLoading$ = this.tokensSelectorService.searchLoading$;

  public get headerText(): string {
    if (this.tokensSelectorService.listType === 'default') {
      return 'modals.tokensListModal.defaultTitle';
    }
    return 'modals.tokensListModal.favoriteTokensTitle';
  }

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: TokensSelectComponentContext,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensService: TokensService,
    private readonly iframeService: IframeService,
    private readonly tokensSelectorService: TokensSelectorService,
    @Self() private readonly destroy$: TuiDestroyService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.initiateContextParams(context.data);
    this.checkAndRefetchTokenList();

    this.tokensSelectorService.tokenSelected$.subscribe(selectedToken => {
      this.tokensService.addToken(selectedToken);
      this.context.completeWith(selectedToken);
    });
  }

  ngOnInit(): void {
    this.setWindowHeight();
    this.initSubscriptions();
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

  /**
   * Inits subscriptions for tokens and searchQuery.
   */
  private initSubscriptions(): void {
    this.tokensService.tokensNetworkState$
      .pipe(
        watch(this.cdr),
        tap((tokensNetworkState: TokensNetworkState) => {
          this.tokensNetworkState = tokensNetworkState;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.tokensSelectorService.blockchain$.subscribe(() => {
      this.checkAndRefetchTokenList();
    });
  }

  private checkAndRefetchTokenList(): void {
    if (this.tokensService.needRefetchTokens) {
      this.tokensService.tokensRequestParameters = undefined;
    }
  }
}
