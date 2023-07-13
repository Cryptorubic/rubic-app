import { Inject, Injectable } from '@angular/core';

import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { EXTERNAL_LINKS } from '@shared/constants/common/links';
import { ActivationResult, LoadResult } from '@shared/guards/models/types';

/**
 * Guard makes redirect from about route to rubic landing.
 */
@Injectable({
  providedIn: 'root'
})
export class LandingRedirectGuard {
  private readonly redirectUrl = EXTERNAL_LINKS.LANDING;

  constructor(@Inject(WINDOW) private readonly window: RubicWindow) {}

  canActivate(): ActivationResult {
    this.window.location.assign(this.redirectUrl);
    return false;
  }

  canLoad(): LoadResult {
    this.window.location.assign(this.redirectUrl);
    return false;
  }
}
