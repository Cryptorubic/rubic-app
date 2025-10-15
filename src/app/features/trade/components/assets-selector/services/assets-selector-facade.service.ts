import { Injectable } from '@angular/core';
import { FromAssetsService } from '@features/trade/components/assets-selector/services/from-assets.service';
import { ToAssetsService } from '@features/trade/components/assets-selector/services/to-assets.service';
import { Asset } from '@features/trade/models/asset';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AssetsSelectorFacadeService {
  constructor(
    private readonly fromAssetsService: FromAssetsService,
    private readonly toAssetsService: ToAssetsService,
    private readonly gtmService: GoogleTagManagerService
  ) {}

  public getAssetsService(type: 'from' | 'to'): FromAssetsService | ToAssetsService {
    return type === 'from' ? this.fromAssetsService : this.toAssetsService;
  }

  public onAssetSelect(asset: Asset, type: 'from' | 'to'): void {
    if (type === 'from') {
      this.gtmService.fireSelectInputTokenEvent(asset.name);
    } else {
      this.gtmService.fireSelectOutputTokenEvent(asset.name);
    }
  }
}
