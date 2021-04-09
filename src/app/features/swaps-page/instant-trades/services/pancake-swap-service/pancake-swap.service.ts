import { Injectable } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import {
  abi,
  maxTransitTokens,
  routingProviders,
  uniSwapContracts,
  WETH
} from './pankace-swap-constants';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { UniswapAbstract } from '../uniswap-abstract/uniswap-abstract';

@Injectable()
export class PancakeSwapService extends UniswapAbstract {
  constructor(
    coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService
  ) {
    super(useTestingModeService, WETH, uniSwapContracts, routingProviders, maxTransitTokens, abi);
    this.coingeckoApiService = coingeckoApiService;
    this.slippageTolerance = 0.015; // 1.5%
    this.tokensToTokensEstimatedGas = new BigNumber(120_000);
    this.tokensToEthEstimatedGas = new BigNumber(150_000);
    this.ethToTokensEstimatedGas = new BigNumber(150_000);
    this.web3Private = web3Private;
    this.web3Public = web3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = web3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
      }
    });
  }
}
