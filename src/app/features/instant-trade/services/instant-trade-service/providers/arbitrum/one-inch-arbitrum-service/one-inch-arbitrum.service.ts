import { Injectable } from '@angular/core';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';
import { CommonOneinchService } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { OneinchProviderAbstract } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';

@Injectable({
  providedIn: 'root'
})
export class OneInchArbitrumService extends OneinchProviderAbstract {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.ONEINCH;

  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.ARBITRUM, commonOneinchService);
  }
}
