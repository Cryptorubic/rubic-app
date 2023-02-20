import { Component, Input } from '@angular/core';
import { HeaderStore } from '@app/core/header/services/header.store';
import { CrossChainTaggedTrade } from '@app/features/swaps/features/cross-chain/models/cross-chain-tagged-trade';
import { CrossChainFormService } from '@app/features/swaps/features/cross-chain/services/cross-chain-form-service/cross-chain-form.service';
import { TRADES_PROVIDERS } from '@app/features/swaps/shared/constants/trades-providers/trades-providers';
import { ProviderInfo } from '@app/features/swaps/shared/models/trade-provider/provider-info';
import { BlockchainName, PriceTokenAmount } from 'rubic-sdk';

@Component({
  selector: 'app-cross-chain-best-route-mobile',
  templateUrl: './cross-chain-best-route-mobile.component.html',
  styleUrls: ['./cross-chain-best-route-mobile.component.scss']
})
export class CrossChainBestRouteMobileComponent {
  public bridgeProvider: ProviderInfo;

  public toTrade: PriceTokenAmount<BlockchainName>;

  @Input() set trade(trade: CrossChainTaggedTrade) {
    this.bridgeProvider = TRADES_PROVIDERS[trade?.route?.bridgeProvider];

    this.toTrade = trade?.trade?.to;
  }

  public readonly isMobile$ = this.headerStore.getMobileDisplayStatus();

  public readonly isCalculating$ = this.crossChainFormService.isCalculating$;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly crossChainFormService: CrossChainFormService
  ) {}
}
