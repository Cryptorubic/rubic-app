import { CommonOneinchService } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/common-oneinch/common-oneinch.service';
import { Injectable } from '@angular/core';
import { OneinchProviderAbstract } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/oneinch/abstract-provider/oneinch-provider.abstract';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

@Injectable({
  providedIn: 'root'
})
export class OneInchEthService extends OneinchProviderAbstract {
  constructor(commonOneinchService: CommonOneinchService) {
    super(BLOCKCHAIN_NAME.ETHEREUM, commonOneinchService);
  }
}
