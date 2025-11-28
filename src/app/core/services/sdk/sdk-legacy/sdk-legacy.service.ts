import { Injectable } from '@angular/core';
import { CoingeckoService } from './coingecko/coingecko.service';
import { BlockchainAdapterFactoryService } from './blockchain-adapter-factory/blockchain-adapter-factory.service';
import { TokenService } from './token-service/token.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SdkLegacyService {
  constructor(
    public readonly coingeckoApi: CoingeckoService,
    public readonly adaptersFactoryService: BlockchainAdapterFactoryService,
    public readonly tokenService: TokenService,
    public readonly httpClient: HttpClient
  ) {}
}
