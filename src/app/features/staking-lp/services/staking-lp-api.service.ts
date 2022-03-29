import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class StakingLpApiService {
  constructor(private readonly httpClient: HttpClient) {}

  getStatistics(): Observable<void> {
    return of(undefined);
  }

  getStakingInfo(): Observable<void> {
    return of(undefined);
  }

  getLpInfo(): Observable<void> {
    return of(undefined);
  }
}
