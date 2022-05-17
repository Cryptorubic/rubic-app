import { CommonOneinchService } from '@features/swaps/core/instant-trade/providers/common/oneinch/common-service/common-oneinch.service';
import { Injectable } from '@angular/core';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADE_PROVIDER } from '@shared/models/instant-trade/instant-trade-provider';

@Injectable({
  providedIn: 'root'
})
export class OneInchBscService extends CommonOneinchService {
  public readonly providerType = INSTANT_TRADE_PROVIDER.ONEINCH;

  constructor() {
    super(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN);
  }
}
