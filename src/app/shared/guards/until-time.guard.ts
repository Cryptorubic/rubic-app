import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActivationResult } from '@shared/guards/models/types';

@Injectable()
export class UntilTimeGuard implements CanActivate {
  private readonly redirectUrl = EXTERNAL_LINKS.LANDING_STAKING;

  private readonly expireDateUTC = Date.UTC(2022, 2, 1, 14, 0, 0, 0);

  private readonly greenwichTimeApiUrl =
    'https://script.googleusercontent.com/macros/echo?user_content_key=Vhsl1EP7sG2pMrcSNoyf0eAn7o8_UMnbX13lYZadzbU6HWn8kDJHWNHkepkSmqSvn3Rj0G4LNOIISxLzLVZLi8i-_6Bp5L5km5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJ9GRkcRevgjTvo8Dc32iw_BLJPcPfRdVKhJT5HNzQuXEeN3QFwl2n0M6ZmO-h7C6bwVq0tbM60-zM6AQdjHj01JxuldTWgDhQ&lib=MwxUjRcLr2qLlnVOLh12wSNkqcO1Ikdrk';

  private readonly maxTimeDiff = 1000;

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly httpClient: HttpClient
  ) {}

  canActivate(): ActivationResult {
    return this.redirectIfExpired() as ActivationResult;
  }

  private redirectIfExpired(): Observable<Boolean> {
    return this.httpClient.get<{ fulldate: string }>(this.greenwichTimeApiUrl).pipe(
      switchMap(response => {
        const currentTimestamp = new Date(response.fulldate).getTime();
        const diff = this.expireDateUTC - currentTimestamp;
        if (diff > this.maxTimeDiff) {
          this.window.location.href = this.redirectUrl;
          return of(false);
        }
        return of(true);
      })
    );
  }
}
