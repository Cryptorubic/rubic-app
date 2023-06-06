import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { FiatsService } from '@core/services/fiats/fiats.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BlockchainName } from 'rubic-sdk';
import { filter, map, takeUntil } from 'rxjs/operators';
import { SearchQueryService } from '@features/swaps/shared/components/assets-selector/services/search-query-service/search-query.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation.service';

@Injectable()
export class FiatsListService {
  private readonly _fiatsToShow$ = new BehaviorSubject<FiatAsset[]>(this.fiatsService.fiats);

  public readonly fiatsToShow$ = this._fiatsToShow$.asObservable();

  private set fiatsToShow(value: FiatAsset[]) {
    this._fiatsToShow$.next(value);
  }

  constructor(
    private readonly fiatsService: FiatsService,
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly searchQueryService: SearchQueryService,
    private readonly destroy$: TuiDestroyService
  ) {
    this.subscribeOnSearchQuery();
  }

  private subscribeOnSearchQuery(): void {
    combineLatest([this.searchQueryService.query$, this.assetsSelectorService.selectorListType$])
      .pipe(
        filter(([_, selectorListType]) => selectorListType === 'fiats'),
        map(([query]) => query),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.fiatsToShow = this.fiatsService.fiats.filter(
          fiat =>
            fiat.symbol.toLowerCase().includes(query.toLowerCase()) ||
            fiat.name.toLowerCase().includes(query.toLowerCase())
        );
      });
  }

  public isDisabled(): boolean {
    const toBlockchain = this.assetsSelectorService.getAssetType('to') as BlockchainName;
    return toBlockchain && !OnramperCalculationService.isSupportedBlockchain(toBlockchain);
  }
}
