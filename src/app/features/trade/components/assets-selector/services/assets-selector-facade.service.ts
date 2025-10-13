import { Injectable } from '@angular/core';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsSelectorFacadeService {
  constructor(
    private readonly fromAssetsService: FromAssetsService,
    private readonly toAssetsService: ToAssetsService
  ) {}

  public getAssetsService(type: 'from' | 'to'): FromAssetsService | ToAssetsService {
    return type === 'from' ? this.fromAssetsService : this.toAssetsService;
  }
}
