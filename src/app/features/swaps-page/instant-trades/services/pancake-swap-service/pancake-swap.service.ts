import { Injectable } from '@angular/core';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { Web3PrivateService } from '../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import {
  abi,
  maxTransitTokens,
  routingProviders,
  uniSwapContracts,
  WETH,
  ethToTokensEstimatedGas,
  tokensToEthEstimatedGas,
  tokensToTokensEstimatedGas
} from './pankace-swap-constants';
import { CoingeckoApiService } from '../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { Web3PublicService } from '../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { BLOCKCHAIN_NAME } from '../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { UniswapAbstract } from '../uniswap-abstract/uniswap-abstract';
import { ErrorsService } from '../../../../../core/services/errors/errors.service';

@Injectable()
export class PancakeSwapService extends UniswapAbstract {
  constructor(
    coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService,
    providerConnectorService: ProviderConnectorService,
    protected readonly errorsService: ErrorsService
  ) {
    super(
      useTestingModeService,
      WETH,
      uniSwapContracts,
      routingProviders,
      maxTransitTokens,
      abi,
      errorsService
    );
    this.providerConnectorService = providerConnectorService;
    this.coingeckoApiService = coingeckoApiService;
    this.tokensToTokensEstimatedGas = tokensToTokensEstimatedGas;
    this.tokensToEthEstimatedGas = tokensToEthEstimatedGas;
    this.ethToTokensEstimatedGas = ethToTokensEstimatedGas;
    this.web3Private = web3Private;
    this.web3Public = web3Public[BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN];
    this.blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;
    this.shouldCalculateGas = false;

    useTestingModeService.isTestingMode.subscribe(value => {
      if (value) {
        this.web3Public = web3Public[BLOCKCHAIN_NAME.ETHEREUM];
      }
    });
  }
}
