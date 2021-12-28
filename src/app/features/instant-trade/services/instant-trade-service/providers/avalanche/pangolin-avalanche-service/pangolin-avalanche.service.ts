import { Injectable } from '@angular/core';
import { PangolinAvalancheConstants } from '@features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import AVAX_CONTRACT_ABI from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/models/avax-contract-abi';
import { AVAX_SWAP_METHOD } from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/models/swap-method';

@Injectable({
  providedIn: 'root'
})
export class PangolinAvalancheService extends CommonUniswapV2Service {
  constructor() {
    super(PangolinAvalancheConstants);
    this.swapsMethod = AVAX_SWAP_METHOD;
    this.contractAbi = AVAX_CONTRACT_ABI;
  }
}
