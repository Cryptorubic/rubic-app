import { Inject, Injectable } from '@angular/core';
import { CanActivate, CanLoad, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

type ActivationResult =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree;

type LoadResult = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;

/**
 * Guard makes redirect from about route to rubic landing.
 */
@Injectable({
  providedIn: 'root'
})
export class LandingRedirectGuard implements CanActivate, CanLoad {
  private readonly redirectUrl = 'https://rubic.finance/';

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
