import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  Self
} from '@angular/core';
import { FiatAsset } from '@shared/models/fiats/fiat-asset';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { AssetSelector } from '@shared/models/asset-selector';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@app/core/services/tokens/tokens.service';

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

  @Input() set asset(value: TokenAmount | null) {
    if (value) {
      this.visibleAsset = this.getTokenAsset(value);
    } else {
      this.visibleAsset = null;
    }
  }

  constructor(
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokenService: TokensService
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

  private getTokenAsset(token: TokenAmount): AssetSelector {
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

  /**
   * Sets default image to token, in case original image has thrown error.
   * @param $event Img error event.
   */
  public onTokenImageError($event: Event): void {
    this.tokenService.onTokenImageError($event);
  }
}
