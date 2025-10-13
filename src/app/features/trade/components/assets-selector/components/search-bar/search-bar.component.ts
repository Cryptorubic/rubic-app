import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiSizeS } from '@taiga-ui/core';
import { Observable } from 'rxjs';
import { AssetsSelectorFacadeService } from '@features/trade/components/assets-selector/services/assets-selector-facade.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  @Input() expandableField: boolean = false;

  @Input() injector: Injector;

  @Input({ required: true }) searchBarType: 'blockchains' | 'tokens';

  @Input({ required: true }) type: 'from' | 'to';

  public isExpanded = false;

  public searchQuery$: Observable<string>;

  public searchBarText: string;

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  ngOnInit() {
    const service = this.assetsSelectorFacade.getAssetsService(this.type);
    this.searchBarText =
      this.searchBarType === 'blockchains'
        ? `Search among ${service.availableBlockchains.length} Chains`
        : 'modals.tokensListModal.searchPlaceholder';

    this.searchQuery$ =
      this.searchBarType === 'blockchains'
        ? this.assetsSelectorFacade.getAssetsService(this.type).assetTypeQuery$
        : this.assetsSelectorFacade.getAssetsService(this.type).assetsQuery$;
  }

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly assetsSelectorFacade: AssetsSelectorFacadeService
  ) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    if (this.searchBarType === 'tokens') {
      this.assetsSelectorFacade.getAssetsService(this.type).assetsQuery = model;
    } else if (this.searchBarType === 'blockchains') {
      this.assetsSelectorFacade.getAssetsService(this.type).assetTypeQuery = model;
    }
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
