import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { Injectable } from '@angular/core';
import { OneinchProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';

@Injectable({
  providedIn: 'root'
})
export class OneInchBscService extends OneinchProviderAbstract {
  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN, commonOneinchService);
  }
}
