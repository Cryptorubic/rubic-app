import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OneInchService } from '../one-inch-service';
import { Web3PrivateService } from '../../../../../../core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from '../../../../../../core/services/blockchain/web3-public-service/web3-public.service';
import { CoingeckoApiService } from '../../../../../../core/services/external-api/coingecko-api/coingecko-api.service';
import { BLOCKCHAIN_NAME } from '../../../../../../shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from '../../../../../../core/services/use-testing-mode/use-testing-mode.service';
import { ErrorsService } from '../../../../../../core/services/errors/errors.service';
import { ProviderConnectorService } from '../../../../../../core/services/blockchain/provider-connector/provider-connector.service';
import { BlockchainsInfo } from '../../../../../../core/services/blockchain/blockchain-info';

@Injectable()
export class OneInchEthService extends OneInchService {
  constructor(
    httpClient: HttpClient,
    coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService,
    protected readonly errorsService: ErrorsService,
    readonly providerConnectorService: ProviderConnectorService
  ) {
    super(httpClient, coingeckoApiService, useTestingModeService, errorsService);

    this.blockchain = BLOCKCHAIN_NAME.ETHEREUM;
    const network = BlockchainsInfo.getBlockchainByName(this.blockchain);
    this.apiBaseUrl = `https://api.1inch.exchange/v3.0/${network.id}/`;
    this.web3Private = web3Private;
    this.web3Public = web3Public[this.blockchain];
    this.providerConnectorService = providerConnectorService;
  }
}
