import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { HeaderStore } from '@core/header/services/header.store';
import { TuiSizeS } from '@taiga-ui/core';
import { SearchQueryService } from '@features/trade/components/assets-selector/services/search-query-service/search-query.service';
import { BlockchainsListService } from '../../services/blockchains-list-service/blockchains-list.service';
import { AssetsSearchQueryService } from '../../services/assets-search-query-service/assets-search-query.service';
import { Observable } from 'rxjs';

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

  public isExpanded = false;

  public searchQuery$: Observable<string>;

  public searchBarText: string;

  public readonly searchBarSize: TuiSizeS = this.headerStore.isMobile ? 'm' : 's';

  ngOnInit(): void {
    this.searchBarText =
      this.searchBarType === 'blockchains'
        ? `Search among ${this.blockchainListService.availableBlockchains.length} Chains`
        : 'modals.tokensListModal.searchPlaceholder';

    this.searchQuery$ =
      this.searchBarType === 'blockchains'
        ? this.assetsSearchQueryService.assetsQuery$
        : this.searchQueryService.query$;
  }

  constructor(
    private readonly searchQueryService: SearchQueryService,
    private readonly assetsSearchQueryService: AssetsSearchQueryService,
    private readonly headerStore: HeaderStore,
    private readonly blockchainListService: BlockchainsListService
  ) {}

  /**
   * Handles input query change.
   * @param model Input string.
   */
  public onQueryChanges(model: string): void {
    if (this.searchBarType === 'tokens') {
      this.searchQueryService.setSearchQuery(model);
    } else if (this.searchBarType === 'blockchains') {
      this.assetsSearchQueryService.assetsQuery = model;
    }
  }

  public expand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
