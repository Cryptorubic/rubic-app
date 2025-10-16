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
import { DOCUMENT } from '@angular/common';

import { HeaderStore } from '@core/header/services/header.store';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { map } from 'rxjs/operators';
import { AssetsSelectorServices } from '@features/trade/components/assets-selector/constants/assets-selector-services';
import { TokensListTypeService } from '@features/trade/components/assets-selector/services/tokens-list-service/tokens-list-type.service';
import { Asset } from '@features/trade/models/asset';
import { TradePageService } from '@app/features/trade/services/trade-page/trade-page.service';
import { AssetsSelectorStateService } from '../../services/assets-selector-state/assets-selector-state.service';
import { TokensFacadeService } from '@core/services/tokens/tokens-facade.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-assets-selector-page',
  templateUrl: './assets-selector-page.component.html',
  styleUrls: ['./assets-selector-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AssetsSelectorServices, TuiDestroyService]
})
export class AssetsSelectorPageComponent implements OnInit, OnDestroy {
  @Input({ required: true }) type: 'from' | 'to';

  @Output() public readonly tokenSelect = new EventEmitter<Asset>();

  public readonly selectorListType$ = of('tokens');

  public readonly headerText$ = this.selectorListType$.pipe(
    map(type => (type === 'blockchains' ? 'Blockchains List' : 'Select Chain and Token'))
  );

  public readonly isMobile = this.headerStore.isMobile;

  constructor(
    private readonly assetsSelectorStateService: AssetsSelectorStateService,
    private readonly tokensListTypeService: TokensListTypeService,
    private readonly headerStore: HeaderStore,
    @Inject(DOCUMENT) private readonly document: Document,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly tradePageService: TradePageService,
    private readonly tokensFacade: TokensFacadeService
  ) {
    this.subscribeOnAssetsSelect();
  }

  ngOnInit(): void {
    this.setWindowHeight();
  }

  ngOnDestroy(): void {
    this.resetWindowHeight();
  }

  public backToForm(): void {
    this.tradePageService.setState('form');
  }

  /**
   * Sets window height through html class name, to prevent broken scroll in Safari.
   */
  private setWindowHeight(): void {
    if (this.isMobile) {
      this.document.documentElement.style.setProperty(
        '--window-inner-height',
        `${window.innerHeight}px`
      );
      this.document.documentElement.classList.add('is-locked');
      this.document.documentElement.classList.add('scroll-y');
    }
  }

  private resetWindowHeight(): void {
    this.document.documentElement.classList.remove('is-locked');
  }

  private subscribeOnAssetsSelect(): void {
    // @TODO TOKENS
    // this.assetsSelectorStateService.assetSelected$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(selectedAsset => {
    //     if (isMinimalToken(selectedAsset)) {
    //       this.tokensFacade.addToken(selectedAsset);
    //     }
    //     this.tokenSelect.emit(selectedAsset);
    //   });
  }
}
