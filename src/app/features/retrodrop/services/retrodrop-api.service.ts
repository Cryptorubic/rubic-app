import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RetrodropUserInfo } from '@features/retrodrop/models/retrodrop-user-info';
import { HttpService } from '@core/services/http/http.service';

@Injectable()
export class RetrodropApiService {
  constructor(private readonly httpService: HttpService) {}

  public fetchRetrodropUserInfo(address: string | null): Observable<RetrodropUserInfo> {
    if (!address) {
      return of([]);
    }
    try {
      return this.httpService.get<RetrodropUserInfo>(`v2/merkle_proofs/retrodrop`, {
        address: address
      });
    } catch (error) {
      console.log('2 ', error);
      return of([]);
    }
  }
}
