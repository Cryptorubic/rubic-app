import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Self
} from '@angular/core';
import { BLOCKCHAINS } from '@shared/constants/blockchain/ui-blockchains';
import { blockchainColor } from '@shared/constants/blockchain/blockchain-color';
import { AssetSelector } from '@shared/models/asset-selector';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { TokensService } from '@app/core/services/tokens/tokens.service';
import { DEFAULT_TOKEN_IMAGE } from '@app/shared/constants/tokens/default-token-image';
import { MAIN_FORM_TYPE, MainFormType } from '@app/features/trade/services/forms-toggler/models';

@Component({
  selector: 'app-asset-selector',
  templateUrl: './asset-selector.component.html',
  styleUrls: ['./asset-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class AssetSelectorComponent implements OnInit {
  private _mainFormType: MainFormType = MAIN_FORM_TYPE.SWAP_FORM;

  @Input() isDisabled?: boolean = false;

  @Input({ required: true }) selectorType: 'from' | 'to';

  @Input({ required: true }) set mainFormType(type: MainFormType) {
    this._mainFormType = type;
    this.emptySelectorText = this.getEmptySelectorText();
  }

  public get mainFormType(): MainFormType {
    return this._mainFormType;
  }

  @Input() set asset(value: TokenAmount | null) {
    if (value) {
      this.visibleAsset = this.getTokenAsset(value);
    } else {
      this.visibleAsset = null;
    }
    this.emptySelectorText = this.getEmptySelectorText();
  }

  @Output() public handleAssetSelection = new EventEmitter<void>();

  public visibleAsset: AssetSelector | null = null;

  public emptySelectorText: string = '';

  public readonly DEFAULT_TOKEN_IMAGE = DEFAULT_TOKEN_IMAGE;

  constructor(
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokenService: TokensService
  ) {}

  ngOnInit(): void {
    this.subOnHideSelectorQueryParamsChange();
  }

  private subOnHideSelectorQueryParamsChange(): void {
    this.queryParamsService.tokensSelectionDisabled$
      .pipe(takeUntil(this.destroy$))
      .subscribe(([hideSelectionFrom, hideSelectionTo]) => {
        if (this.selectorType === 'from') {
          this.isDisabled = hideSelectionFrom;
        } else {
          this.isDisabled = hideSelectionTo;
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

  public handleSelection(): void {
    if (this.isDisabled) return;
    this.handleAssetSelection.emit();
  }

  public onTokenImageError($event: Event): void {
    this.tokenService.onTokenImageError($event);
  }

  private getEmptySelectorText(): string {
    if (this.mainFormType === MAIN_FORM_TYPE.GAS_FORM && this.selectorType === 'from') {
      return 'Select Source Token';
    }
    if (this.mainFormType === MAIN_FORM_TYPE.GAS_FORM && this.selectorType === 'to') {
      return 'Select Target Chain';
    }
    return 'Select Token';
  }
}
