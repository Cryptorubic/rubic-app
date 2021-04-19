import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { concatMap, skip, take } from 'rxjs/operators';
import { HealthcheckService } from './core/services/backend/healthcheck/healthcheck.service';
import { TokensService } from './core/services/backend/tokens-service/tokens.service';
import { QueryParams } from './core/services/query-params/models/query-params';
import { QueryParamsService } from './core/services/query-params/query-params.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isBackendAvailable: boolean;

  constructor(
    private readonly healthcheckService: HealthcheckService,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    private readonly queryParamsService: QueryParamsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly tokensService: TokensService
  ) {
    this.setupQueryParams();
    this.setupLanguage();
    this.healthcheckService
      .healthCheck()
      .then(isAvailable => (this.isBackendAvailable = isAvailable));
  }

  private async setupQueryParams(): Promise<void> {
    const $tokensSubscription = this.tokensService.tokens.asObservable().pipe(take(2), skip(1));
    $tokensSubscription
      .pipe(concatMap(() => this.activatedRoute.queryParams))
      .subscribe(async (queryParams: QueryParams) => {
        if (queryParams) {
          if (queryParams.iframe === 'true') {
            this.document.body.classList.add('iframe');
          }
          const route = this.router.url.split('?')[0].substr(1);
          const hasParams = Object.keys(queryParams).length !== 0;
          if (hasParams && route !== 'bridge') {
            await this.queryParamsService.initiateTradesParams(queryParams, this.cdr);
          } else if (hasParams) {
            this.queryParamsService.initiateBridgeParams(queryParams);
          }
        }
      });
  }

  private setupLanguage(): void {
    const supportedLanguages = ['en', 'ko', 'ru', 'zh'];
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = supportedLanguages.includes(userRegionLanguage)
      ? userRegionLanguage
      : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }
}
