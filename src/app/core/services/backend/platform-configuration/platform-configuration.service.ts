import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';

import { BehaviorSubject, catchError, map, Observable, of, retry, tap } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { BlockchainStatus } from '@core/services/backend/platform-configuration/models/blockchain-status';
import {
  BlockchainName,
  CrossChainTradeType,
  FROM_BACKEND_CROSS_CHAIN_PROVIDERS,
  ToBackendCrossChainProviders
} from '@cryptorubic/core';
import { defaultInfoV3Config } from './constants/defauls-info-v3-config';
import { PlatformConfigV3, PlatformConfigV3CcrProviderInfo } from './models/platform-config-v3';

@Injectable({
  providedIn: 'root'
})
export class PlatformConfigurationService {
  private readonly _ccrProvidersInfo$ = new BehaviorSubject<
    Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo>
  >(undefined);

  public readonly ccrProvidersInfo$ = this._ccrProvidersInfo$.asObservable();

  public get ccrProvidersInfo(): Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo> {
    return this._ccrProvidersInfo$.getValue();
  }

  private readonly _availableBlockchains$ = new BehaviorSubject<BlockchainStatus[]>(undefined);

  public readonly availableBlockchains$ = this._availableBlockchains$.asObservable();

  public get availableBlockchains(): BlockchainStatus[] {
    return this._availableBlockchains$.getValue();
  }

  constructor(private httpClient: HttpClient) {}

  public loadPlatformConfig(): Observable<boolean> {
    return this.httpClient
      .get<PlatformConfigV3>(`${ENVIRONMENT.apiBaseUrl}/v2/info/status_info_v3`)
      .pipe(
        timeout(5_000),
        retry(1),
        catchError(() => of(defaultInfoV3Config)),
        tap(infoV3Response => {
          if (infoV3Response.appIsActive === true) {
            this.setBlockchainsInfo(infoV3Response.networks);
            this.setCcrProvidersInfo(infoV3Response.crosschainProviders);
          }
        }),
        map(infoV3Response => infoV3Response.appIsActive)
      );
  }

  public isAvailableBlockchain(blockchain: BlockchainName): boolean {
    return this.availableBlockchains
      ? this.availableBlockchains.some(el => el.blockchain === blockchain && el.isActive)
      : true;
  }

  private setBlockchainsInfo(apiBlockchainsInfo: PlatformConfigV3['networks']): void {
    const tierMap = {
      TIER_ONE: 1,
      TIER_TWO: 2
      // TIER_THREE: 3
    } as const;
    const blockchainStatuses = Object.entries(apiBlockchainsInfo).map(
      ([blockchain, info]) =>
        ({ blockchain, tier: tierMap[info.tier], isActive: info.isActive } as BlockchainStatus)
    );

    this._availableBlockchains$.next(blockchainStatuses);
  }

  private setCcrProvidersInfo(
    crossChainProviders: Record<ToBackendCrossChainProviders, PlatformConfigV3CcrProviderInfo>
  ): void {
    const entries = Object.entries(crossChainProviders) as [
      ToBackendCrossChainProviders,
      PlatformConfigV3CcrProviderInfo
    ][];
    const info = Object.fromEntries(
      entries.map(([pythonProviderName, status]) => [
        FROM_BACKEND_CROSS_CHAIN_PROVIDERS[pythonProviderName],
        status
      ])
    ) as Record<CrossChainTradeType, PlatformConfigV3CcrProviderInfo>;

    this._ccrProvidersInfo$.next(info);
  }
}
