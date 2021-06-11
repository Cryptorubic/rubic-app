import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Web3PrivateService } from 'src/app/core/services/blockchain/web3-private-service/web3-private.service';
import { Web3PublicService } from 'src/app/core/services/blockchain/web3-public-service/web3-public.service';
import { CoingeckoApiService } from 'src/app/core/services/external-api/coingecko-api/coingecko-api.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { UseTestingModeService } from 'src/app/core/services/use-testing-mode/use-testing-mode.service';
import { TranslateService } from '@ngx-translate/core';
import { BlockchainsInfo } from 'src/app/core/services/blockchain/blockchain-info';
import { OneInchService } from '../one-inch-service';
import { ErrorsOldService } from '../../../../../../core/services/errors-old/errors-old.service';
import { ProviderConnectorService } from '../../../../../../core/services/blockchain/provider-connector/provider-connector.service';

@Injectable()
export class OneInchPolService extends OneInchService {
  constructor(
    httpClient: HttpClient,
    coingeckoApiService: CoingeckoApiService,
    web3Private: Web3PrivateService,
    web3Public: Web3PublicService,
    useTestingModeService: UseTestingModeService,
    protected readonly translateService: TranslateService,
    protected readonly errorsService: ErrorsOldService,
    protected readonly providerConnectorService: ProviderConnectorService
  ) {
    super(httpClient, coingeckoApiService, useTestingModeService, errorsService);
    this.providerConnectorService = providerConnectorService;
    this.blockchain = BLOCKCHAIN_NAME.POLYGON;
    const network = BlockchainsInfo.getBlockchainByName(this.blockchain);
    this.apiBaseUrl = `https://api.1inch.exchange/v3.0/${network.id}/`;
    this.web3Private = web3Private;
    this.web3Public = web3Public[this.blockchain];
  }
}
