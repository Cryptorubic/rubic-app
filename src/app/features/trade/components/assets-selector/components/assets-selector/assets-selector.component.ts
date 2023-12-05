import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DOCUMENT } from '@angular/common';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { isMinimalToken } from '@shared/utils/is-token';
import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { HeaderStore } from '@core/header/services/header.store';
import { AssetsSelectorServices } from '@features/trade/components/assets-selector/constants/assets-selector-services';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import {
  AssetsSelectorComponentContext,
  AssetsSelectorComponentInput
} from '@features/trade/components/assets-selector/models/assets-selector-component-context';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';

@Component({
  selector: 'polymorpheus-assets-selector',
  templateUrl: './assets-selector.component.html',
  styleUrls: ['./assets-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: AssetsSelectorServices
})
export class AssetsSelectorComponent implements OnInit, OnDestroy {
  public idPrefix: string;

  public readonly headerText$ = combineLatest([
    this.assetsSelectorService.selectorListType$,
    this.tokensListTypeService.listType$
  ]).pipe(
    map(([selectorListType, tokensListType]) => {
      if (selectorListType === 'blockchains') {
        return 'Blockchains List';
      }
      if (selectorListType === 'fiats') {
        return 'Fiats List';
      }
      if (tokensListType === 'default') {
        return 'modals.tokensListModal.defaultTitle';
      }
      return 'modals.tokensListModal.favoriteTokensTitle';
    })
  );

  public readonly selectorListType$ = this.assetsSelectorService.selectorListType$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT) private readonly context: AssetsSelectorComponentContext,
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.initiateContextParams(context.data);

    this.assetsSelectorService.assetSelected$.subscribe(selectedAsset => {
      if (isMinimalToken(selectedAsset)) {
        this.tokensStoreService.addToken(selectedAsset);
      }
      this.context.completeWith(selectedAsset);
    });
  }

  ngOnInit(): void {
    this.setWindowHeight();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  private initiateContextParams(context: AssetsSelectorComponentInput): void {
    this.idPrefix = context.idPrefix;
    this.assetsSelectorService.initParameters(context);
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
    this.document.documentElement.classList.add('scroll-y');
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }
}
