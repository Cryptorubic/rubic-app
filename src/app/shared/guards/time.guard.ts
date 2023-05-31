import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { Observable, of } from 'rxjs';

@Injectable()
export class TimeGuard implements CanActivate {
  constructor(@Inject(WINDOW) private readonly window: RubicWindow) {}

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const { redirectPath, expiredDate } = route.data;
    const currentDate = Date.now();

    if (currentDate < expiredDate) {
      this.window.location.href = redirectPath;
      return of(false);
    } else {
      return of(true);
    }
  }
}
