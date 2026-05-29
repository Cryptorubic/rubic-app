import { Injectable } from '@angular/core';
import { HttpService } from '@app/core/services/http/http.service';
import { PrivacyCashFeesResp } from '../providers/privacycash/models/privacycash-api-types';
import { firstValueFrom } from 'rxjs';
import { Cache as Memo } from '@cryptorubic/core';

@Injectable()
export class PrivacyApiService {
  constructor(private readonly httpService: HttpService) {}

  @Memo({ maxAge: 60 * 60_000 })
  public async fetchPrivacyCashFees(): Promise<PrivacyCashFeesResp> {
    return firstValueFrom(
      this.httpService.get<PrivacyCashFeesResp>('', {}, 'https://api3.privacycash.org/config', {
        timeoutMs: 2_000,
        retry: 0,
        external: true
      })
    );
  }
}
