import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, of } from 'rxjs';
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

  public getOnChainRewardData(params: OnChainRewardRequestParams): Promise<OnChainRewardResponse> {
    return firstValueFrom(
      this.httpService.get<OnChainRewardResponse>(`v2/rewards/onchain_reward_amount`, params)
    );
  }

  public getCrossChainRewardData(
    params: CrossChainRewardRequestParams
  ): Promise<CrossChainRewardResponse> {
    return firstValueFrom(
      this.httpService.get<CrossChainRewardResponse>(`v2/rewards/crosschain_reward_amount`, params)
    );
  }
}
