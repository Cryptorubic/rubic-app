import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { AssetsSelectorService } from '@features/swaps/shared/components/assets-selector/services/assets-selector-service/assets-selector.service';
import { FiatAsset } from '@features/swaps/shared/models/fiats/fiat-asset';
import { FiatsListService } from '@features/swaps/shared/components/assets-selector/services/fiats-list-service/fiats-list.service';

@Component({
  selector: 'app-fiats-list',
  templateUrl: './fiats-list.component.html',
  styleUrls: ['./fiats-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class FiatsListComponent {
  public readonly fiats$ = this.fiatsListService.fiatsToShow$;

  constructor(
    private readonly assetsSelectorService: AssetsSelectorService,
    private readonly fiatsListService: FiatsListService
  ) {}

  public onFiatSelect(fiat: FiatAsset): void {
    this.assetsSelectorService.onAssetSelect(fiat);
  }
}
