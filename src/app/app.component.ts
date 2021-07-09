import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { HealthcheckService } from './core/services/backend/healthcheck/healthcheck.service';
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
    private readonly queryParamsService: QueryParamsService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly errorService: ErrorsService
  ) {
    const queryParamsSubscription$ = this.activatedRoute.queryParams.subscribe(
      (queryParams: QueryParams) => {
        try {
          this.queryParamsService.setupQueryParams(queryParams);
        } catch (err) {
          this.errorService.catch$(err);
        }
      }
    );
    setTimeout(() => {
      queryParamsSubscription$.unsubscribe();
    });

    this.setupLanguage();

    this.healthcheckService
      .healthCheck()
      .then(isAvailable => (this.isBackendAvailable = isAvailable));
  }

  private setupLanguage(): void {
    const supportedLanguages = ['en', 'ko', 'ru', 'zh', 'es'];
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = supportedLanguages.includes(userRegionLanguage)
      ? userRegionLanguage
      : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }
}
