import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { TokensService } from '@core/services/tokens/tokens.service';
import { DOCUMENT } from '@angular/common';

import { TokensStoreService } from '@core/services/tokens/tokens-store.service';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { AssetsSelectorServices } from '@features/trade/components/assets-selector/constants/assets-selector-services';
import { AssetsSelectorService } from '@features/trade/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { Asset } from '@features/trade/models/asset';
import { isMinimalToken } from '@shared/utils/is-token';

@Component({
  selector: ' app-assets-selector-page',
  templateUrl: './assets-selector-page.component.html',
  styleUrls: ['./assets-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AssetsSelectorServices, TuiDestroyService]
})
export class AssetsSelectorPageComponent implements OnInit, OnDestroy {
  // @Input() public idPrefix: string;

  @Input() set type(type: 'from' | 'to') {
    this.assetsSelectorService.initParameters({ formType: type });
  }

  @Output() public readonly tokenSelect = new EventEmitter<Asset>();

  public readonly selectorListType$ = this.assetsSelectorService.selectorListType$;

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensStoreService: TokensStoreService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService
  ) {
    this.assetsSelectorService.initParameters({ formType: this.type });
    this.subscribeOnAssetsSelect();
  }

  ngOnInit(): void {
    this.setWindowHeight();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
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

    console.log(window.devicePixelRatio * 100);
    console.log(window.devicePixelRatio * 100 > 100);

    if (window.devicePixelRatio * 100 > 100) {
      this.document.documentElement.classList.add('scroll-y');
    }
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }

  private subscribeOnAssetsSelect(): void {
    this.assetsSelectorService.assetSelected$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedAsset => {
        if (isMinimalToken(selectedAsset)) {
          this.tokensStoreService.addToken(selectedAsset);
        }
        this.tokenSelect.emit(selectedAsset);
      });
  }
}
