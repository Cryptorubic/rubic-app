import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanLoad } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { Observable, of } from 'rxjs';

@Injectable()
export class TimeGuard implements CanActivate, CanLoad {
  private readonly redirectUrl = EXTERNAL_LINKS.LANDING_STAKING;

  private readonly expiredDateUTC = Date.UTC(2022, 7, 5, 14, 0);

  constructor(@Inject(WINDOW) private readonly window: RubicWindow) {}

  public canActivate(): Observable<boolean> {
    if (Date.now() < this.expiredDateUTC) {
      this.window.location.href = this.redirectUrl;
      return of(false);
    } else {
      return of(true);
    }
  }

  public canLoad(): Observable<boolean> {
    if (Date.now() < this.expiredDateUTC) {
      this.window.location.href = this.redirectUrl;
      return of(false);
    } else {
      return of(true);
    }
  }
}
