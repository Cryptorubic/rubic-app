import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AirdropUserPointsInfo } from '@features/airdrop/models/airdrop-user-info';
import { HttpService } from '@core/services/http/http.service';
import {
  CrossChainRewardRequestParams,
  CrossChainRewardResponse,
  OnChainRewardRequestParams,
  OnChainRewardResponse
} from './models/airdrop-api-types';

@Injectable({ providedIn: 'root' })
export class AirdropPointsApiService {
  constructor(private readonly httpService: HttpService) {}

  public fetchAirdropUserPointsInfo(address: string | null): Observable<AirdropUserPointsInfo> {
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<AirdropUserPointsInfo>(`rewards/?address=${address}`);
  }

  public getOnChainSeNPoints(params: OnChainRewardRequestParams): Observable<number> {
    return this.httpService
      .get<OnChainRewardResponse>(`v2/rewards/onchain_reward_amount`, params)
      .pipe(map(res => res.amount));
  }

  public getCrossChainSeNPoints(params: CrossChainRewardRequestParams): Observable<number> {
    return this.httpService
      .get<CrossChainRewardResponse>(`v2/rewards/crosschain_reward_amount`, params)
      .pipe(map(res => res.amount));
  }
}
