import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { Injectable } from '@angular/core';
import { OneinchProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { INSTANT_TRADES_PROVIDER } from '@shared/models/instant-trade/INSTANT_TRADES_PROVIDER';

@Injectable({
  providedIn: 'root'
})
export class OneInchPolService extends OneinchProviderAbstract {
  public readonly providerType = INSTANT_TRADES_PROVIDER.ONEINCH;

  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.POLYGON, commonOneinchService);
  }
}
