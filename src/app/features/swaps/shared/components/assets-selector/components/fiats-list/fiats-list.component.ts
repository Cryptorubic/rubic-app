import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { FiatsListService } from '@features/swaps/shared/components/assets-selector/services/fiats-list-service/fiats-list.service';
import { LIST_ANIMATION } from '@features/swaps/shared/components/assets-selector/animations/list-animation';
import { IframeService } from '@core/services/iframe/iframe.service';

@Component({
  selector: 'app-fiats-list',
  templateUrl: './fiats-list.component.html',
  styleUrls: ['./fiats-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [LIST_ANIMATION]
})
export class FiatsListComponent {
  public readonly fiats$ = this.fiatsListService.fiatsToShow$;

  public readonly isIframe = this.iframeService.isIframe;

  constructor(
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly fiatsListService: FiatsListService,
    private readonly iframeService: IframeService
  ) {}

  public onFiatSelect(fiat: FiatAsset): void {
    this.assetsSelectorService.onAssetSelect(fiat);
  }
}
