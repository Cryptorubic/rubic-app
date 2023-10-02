import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AirdropUserPointsInfo } from '@features/airdrop/models/airdrop-user-info';
import { HttpService } from '@core/services/http/http.service';

@Injectable()
export class AirdropPointsApiService {
  constructor(private readonly httpService: HttpService) {}

  public fetchAirdropUserPointsInfo(address: string | null): Observable<AirdropUserPointsInfo> {
    if (!address) {
      return of({ confirmed: 0, pending: 0 });
    }
    return this.httpService.get<AirdropUserPointsInfo>(`rewards/?address=${address}`);
  }
}
