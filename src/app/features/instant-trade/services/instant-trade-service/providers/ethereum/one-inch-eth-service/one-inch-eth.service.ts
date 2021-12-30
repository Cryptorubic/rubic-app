import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { Injectable } from '@angular/core';
import { OneinchProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';
import { BLOCKCHAIN_NAME } from '@shared/models/blockchain/blockchain-name';
import { INSTANT_TRADES_PROVIDERS } from '@shared/models/instant-trade/instant-trade-providers';

@Injectable({
  providedIn: 'root'
})
export class OneInchEthService extends OneinchProviderAbstract {
  public readonly providerType = INSTANT_TRADES_PROVIDERS.ONEINCH;

  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.ETHEREUM, commonOneinchService);
  }
}
