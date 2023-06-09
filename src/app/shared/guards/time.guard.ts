import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { catchError, firstValueFrom, from, map, Observable, of } from 'rxjs';
import { HttpService } from '@core/services/http/http.service';
import { LoadResult } from '@shared/guards/models/types';
import { HeaderStore } from '@core/header/services/header.store';

@Injectable()
export class TimeGuard implements CanActivate, CanLoad {
  private readonly isMobile = this.headerStore.isMobile;

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly headerStore: HeaderStore,
    private readonly httpService: HttpService
  ) {}

  public canLoad(route: ActivatedRouteSnapshot): LoadResult {
    return this.canActivate(route);
  }

  private defaultTimeGuard(
    redirectPath: string,
    expiredDateInSeconds: number
  ): Observable<boolean> {
    const currentDate = Date.now();

    if (currentDate < expiredDateInSeconds * 1000) {
      this.window.location.href = redirectPath;
      return of(false);
    } else {
      return of(true);
    }
  }

  public canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const { redirectPath, expiredDateInSeconds } = route.data;

    if (this.isMobile) {
      return this.defaultTimeGuard(redirectPath, expiredDateInSeconds);
    } else {
      return from(
        firstValueFrom(
          this.httpService.get<{ current_timestamp: number }>('current_timestamp').pipe(
            map(response => {
              if (response.current_timestamp < expiredDateInSeconds) {
                this.window.location.href = redirectPath;
                return false;
              } else {
                return true;
              }
            }),
            catchError(() => this.defaultTimeGuard(redirectPath, expiredDateInSeconds))
          )
        )
      );
    }
  }
}
