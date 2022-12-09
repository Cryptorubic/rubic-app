import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { FiatsService } from '@core/services/fiats/fiats.service';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { BlockchainName } from 'rubic-sdk';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';

@Injectable()
export class FiatsListService {
  private readonly _fiatsToShow$ = new BehaviorSubject<FiatAsset[]>(this.fiatsService.fiats);

  public readonly fiatsToShow$ = this._fiatsToShow$.asObservable();

  // todo add search query
  private set fiatsToShow(value: FiatAsset[]) {
    this._fiatsToShow$.next(value);
  }

  constructor(
    private readonly fiatsService: FiatsService,
    private readonly assetsSelectorService: AssetsSelectorService
  ) {}

  public isDisabled(): boolean {
    const toBlockchain = this.assetsSelectorService.getAssetType('to') as BlockchainName;
    return toBlockchain && !OnramperCalculationService.isSupportedBlockchain(toBlockchain);
  }
}
