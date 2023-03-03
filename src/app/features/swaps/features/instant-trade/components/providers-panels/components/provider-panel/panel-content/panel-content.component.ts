import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Self
} from '@angular/core';
import { TradePanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/trade-panel-data';
import { ProviderPanelData } from '@features/swaps/features/instant-trade/components/providers-panels/components/provider-panel/models/provider-panel-data';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { SwapFormService } from '@core/services/swaps/swap-form.service';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { takeUntil } from 'rxjs/operators';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { HeaderStore } from '@app/core/header/services/header.store';

@Component({
  selector: 'app-panel-content',
  templateUrl: './panel-content.component.html',
  styleUrls: ['./panel-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService]
})
export class PanelContentComponent implements OnInit {
  @Input() public tradePanelData: TradePanelData;

  @Input() public providerPanelData: ProviderPanelData;

  @Input() public isBestProvider: boolean;

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public displayGas: boolean;

  private toToken: TokenAmount;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly cdr: ChangeDetectorRef,
    private readonly swapFormService: SwapFormService,
    @Self() private readonly destroy$: TuiDestroyService
  ) {}

  public ngOnInit(): void {
    this.displayGas = this.tradePanelData?.blockchain === BLOCKCHAIN_NAME.ETHEREUM;
    console.log('trade', this.tradePanelData, this.providerPanelData);
    this.swapFormService.inputValue$.pipe(takeUntil(this.destroy$)).subscribe(form => {
      const { toToken } = form;
      if (this.toToken?.price !== toToken?.price) {
        this.toToken = toToken;
        this.cdr.markForCheck();
      }
    });
  }
}
