import { Inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { Observable, of } from 'rxjs';
import { ActivationResult } from '@shared/guards/models/types';
import { switchMap } from 'rxjs/operators';
import { LiquidityProvidingService } from '@app/features/liquidity-providing/services/liquidity-providing.service';

@Injectable()
export class LpRoundTimeGuard implements CanActivate {
  private readonly redirectUrl = EXTERNAL_LINKS.LANDING_LP;

  constructor(
    @Inject(WINDOW) private readonly window: RubicWindow,
    private readonly lpService: LiquidityProvidingService
  ) {}

  canActivate(): ActivationResult {
    return this.redirectIfNotStarted() as ActivationResult;
  }

  private redirectIfNotStarted(): Observable<Boolean> {
    return this.lpService.getStartAndEndTime().pipe(
      switchMap(startTime => {
        // if LP contract has start time === 0 - round didnt started
        const isStarted = +startTime !== 0;

        if (!isStarted) {
          this.window.location.href = this.redirectUrl;
        }
        return of(isStarted);
      })
    );
  }
}
