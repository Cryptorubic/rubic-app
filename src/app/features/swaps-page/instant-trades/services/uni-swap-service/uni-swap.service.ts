import { Injectable } from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import {
  abi,
  ethToTokensEstimatedGas,
  maxTransitTokens,
  routingProviders,
  tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas,
  uniSwapContracts,
  WETH
} from './uni-swap-constants';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { UniswapAbstract } from '../uniswap-abstract/uniswap-abstract';

@Injectable()
export class UniSwapService extends UniswapAbstract {
  constructor(
    coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService,
    providerConnectorService: ProviderConnectorService
  ) {
    super(useTestingModeService, WETH, uniSwapContracts, routingProviders, maxTransitTokens, abi);
    this.providerConnectorService = providerConnectorService;
    this.coingeckoApiService = coingeckoApiService;
    this.slippageTolerance = 0.015; // 1.5%
    this.tokensToTokensEstimatedGas = tokensToTokensEstimatedGas;
    this.tokensToEthEstimatedGas = tokensToEthEstimatedGas;
    this.ethToTokensEstimatedGas = ethToTokensEstimatedGas;
    this.web3Private = web3Private;
    this.web3Public = web3Public[BLOCKCHAIN_NAME.ETHEREUM];
    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    this.shouldCalculateGas = true;

    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = web3Public[BLOCKCHAIN_NAME.ETHEREUM];
      }
    });
  }
}
