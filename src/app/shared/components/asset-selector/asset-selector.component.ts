import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Self
} from '@angular/core';
import { AvailableTokenAmount } from '@shared/models/tokens/available-token-amount';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { AssetSelector } from '@shared/models/asset-selector';
import { Asset } from '@features/trade/models/asset';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';

@Component({
  selector: 'app-asset-selector',
  templateUrl: './asset-selector.component.html',
  styleUrls: ['./asset-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AssetSelectorComponent {
  public visibleAsset: AssetSelector | null = null;

  @Output() public handleAssetSelection = new EventEmitter<void>();

  @Input({ required: true }) selectorType: 'from' | 'to';

  public disableSelection: boolean = false;

  @Input() set asset(value: Asset | null) {
    if (value) {
      this.visibleAsset = 'amount' in value ? this.getTokenAsset(value) : this.getFiatAsset(value);
    } else {
      this.visibleAsset = null;
    }
  }

  constructor(
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.queryParamsService.tokensSelectionDisabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hideSelectionFrom, hideSelectionTo]) => {
        if (this.selectorType === 'from') {
          this.disableSelection = hideSelectionFrom;
        } else {
          this.disableSelection = hideSelectionTo;
        }
        this.cdr.markForCheck();
      });
  }

  private getTokenAsset(token: AvailableTokenAmount): AssetSelector {
    const blockchain = BLOCKCHAINS[token.blockchain];
    const color = blockchainColor[token.blockchain];

    return {
      secondImage: blockchain.img,
      secondLabel: blockchain.name,
      mainImage: token.image,
      mainLabel: token.symbol,
      secondColor: color
    };
  }

  private getFiatAsset(fiat: FiatAsset): AssetSelector {
    // @TODO NEW DESIGN
    return {
      secondImage: '',
      secondLabel: 'Fiat currency',
      mainImage: fiat.image,
      mainLabel: fiat.name,
      secondColor: 'white'
    };
  }

  public handleSelection(): void {
    if (this.disableSelection) {
      return;
    }
    this.handleAssetSelection.emit();
  }
}
