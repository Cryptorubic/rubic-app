import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from 'src/environments/environment';
import {
  BackendBlockchain,
  FROM_BACKEND_BLOCKCHAINS
} from '@app/shared/constants/blockchain/backend-blockchains';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { BlockchainName } from 'rubic-sdk';

interface PlatformConfig {
  server_is_active: boolean;
  networks: {
    [key: BackendBlockchain]: boolean;
  };
  providers: {
    [key: string]: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class HealthcheckService {
  private readonly _availableCcrProviders$ = new BehaviorSubject<string[]>([]);

  public get availableCcrProviders$(): Observable<string[]> {
    return this._availableCcrProviders$.asObservable();
  }

  public get availableCcrProviders(): string[] {
    return this._availableCcrProviders$.getValue();
  }

  private readonly _availableBlockchains$ = new BehaviorSubject<BlockchainName[]>(undefined);

  public get availableBlockchains$(): Observable<BlockchainName[]> {
    return this._availableBlockchains$.asObservable();
  }

  public get availableBlockchains(): BlockchainName[] {
    return this._availableBlockchains$.getValue();
  }

  constructor(private httpClient: HttpClient) {}

  public loadPlatformConfig(): Observable<boolean> {
    return this.httpClient.get<PlatformConfig>(`${ENVIRONMENT.apiBaseUrl}/info/status_info`).pipe(
      tap(response => {
        if (response.server_is_active === true) {
          this._availableBlockchains$.next(this.mapAvailableBlockchains(response.networks));
        }
      }),
      map(response => response.server_is_active),
      catchError(() => of(true))
    );
  }

  public isAvailableBlockchain(blockchain: BlockchainName): boolean {
    return this.availableBlockchains.includes(blockchain);
  }

  private mapAvailableBlockchains(availableBlockchains: {
    [key: BackendBlockchain]: boolean;
  }): BlockchainName[] {
    return Object.entries(availableBlockchains)
      .filter(([_, availability]) => availability)
      .map(entry => {
        console.log(FROM_BACKEND_BLOCKCHAINS[entry[0]], entry[0]);
        return FROM_BACKEND_BLOCKCHAINS[entry[0]];
      });
  }

  public healthCheck(): Promise<boolean> {
    return new Promise(resolve => {
      this.httpClient
        .get(`${ENVIRONMENT.apiBaseUrl}/v1/healthcheck`, { observe: 'response' })
        .subscribe(
          response => resolve(response.status === 200),
          () => resolve(false)
        );
    });
  }
}
