import { Injectable } from '@angular/core';
import {
  AVAX_SWAP_METHOD,
  pangolinAvalancheConstants
} from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/pangolin-avalanche-service/pangolin-avalanche-constants';
import { CommonUniswapV2Service } from 'src/app/features/instant-trade/services/instant-trade-service/providers/common/uniswap-v2/common-service/common-uniswap-v2.service';
import AVAX_CONTRACT_ABI from 'src/app/features/instant-trade/services/instant-trade-service/providers/avalanche/models/avax-contract-abi';

@Injectable({
  providedIn: 'root'
})
export class PangolinAvalancheService extends CommonUniswapV2Service {
  constructor() {
    super(pangolinAvalancheConstants);
    this.swapsMethod = AVAX_SWAP_METHOD;
    this.contractAbi = AVAX_CONTRACT_ABI;
  }
}
