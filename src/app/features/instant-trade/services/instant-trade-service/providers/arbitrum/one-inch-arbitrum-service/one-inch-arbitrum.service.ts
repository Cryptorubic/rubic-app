import { Injectable } from '@angular/core';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';
import { CommonOneinchService } from '@features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-service/common-oneinch.service';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

@Injectable({
  providedIn: 'root'
})
export class OneInchArbitrumService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.ARBITRUM);
  }
}
