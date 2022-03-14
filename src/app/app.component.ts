import { AfterViewInit, Component, Inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { DOCUMENT } from '@angular/common';
import { HealthcheckService } from '@core/services/backend/healthcheck/healthcheck.service';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { GoogleTagManagerService } from '@core/services/google-tag-manager/google-tag-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public isBackendAvailable: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly iframeService: IframeService,
    private readonly gtmService: GoogleTagManagerService,
    healthcheckService: HealthcheckService,
    queryParamsService: QueryParamsService,
    activatedRoute: ActivatedRoute,
    errorService: ErrorsService
  ) {
    const queryParamsSubscription$ = activatedRoute.queryParams.subscribe(
      (queryParams: QueryParams) => {
        try {
          queryParamsService.setupQueryParams(queryParams);
        } catch (err) {
          errorService.catch(err);
        }
      }
    );
    setTimeout(() => {
      queryParamsSubscription$.unsubscribe();
    });

    this.setupLanguage();

    healthcheckService.healthCheck().then(isAvailable => {
      this.isBackendAvailable = isAvailable;
      document.getElementById('loader')?.classList.add('disabled');
      setTimeout(() => document.getElementById('loader')?.remove(), 400); /* ios safari */
    });
  }

  ngAfterViewInit() {
    this.gtmService.addGtmToDom();

    if (this.iframeService.isIframe) {
      this.removeLiveChatInIframe();
      this.document.getElementById('gradient')?.remove();
      this.document.getElementById('wave').hidden = true;
    }
  }

  private removeLiveChatInIframe(): void {
    const observer = new MutationObserver(() => {
      const liveChat = this.document.getElementsByClassName('carrotquest-css-reset')[0];
      if (liveChat) {
        liveChat.remove();
        observer.disconnect();
      }
    });
    observer.observe(this.document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });
  }

  private setupLanguage(): void {
    const supportedLanguages = ['en', 'ko', 'ru', 'zh', 'es', 'tr'];
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = supportedLanguages.includes(userRegionLanguage)
      ? userRegionLanguage
      : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }
}
