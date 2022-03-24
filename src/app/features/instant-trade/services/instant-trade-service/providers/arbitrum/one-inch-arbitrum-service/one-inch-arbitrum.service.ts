import { Injectable } from '@angular/core';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonOneinchService } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { OneinchProviderAbstract } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';

@Injectable({
  providedIn: 'root'
})
export class OneInchArbitrumService extends OneinchProviderAbstract {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.ARBITRUM, commonOneinchService);
  }
}
