import { AfterViewInit, Component, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { ErrorsService } from 'src/app/core/errors/errors.service';
import { IframeService } from 'src/app/core/services/iframe/iframe.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { HealthcheckService } from './core/services/backend/healthcheck/healthcheck.service';
import { QueryParams } from './core/services/query-params/models/query-params';
import { QueryParamsService } from './core/services/query-params/query-params.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  public isBackendAvailable: boolean;

  private $iframeSubscription: Subscription;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly iframeService: IframeService,
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

    healthcheckService.healthCheck().then(isAvailable => (this.isBackendAvailable = isAvailable));
  }

  ngAfterViewInit() {
    this.$iframeSubscription = this.iframeService.isIframe$.subscribe(isIframe => {
      if (isIframe) {
        this.removeLiveChatInIframe();
        this.document.getElementById('gradient')?.remove();
        this.document.getElementById('wave').hidden = true;
      }
    });
  }

  ngOnDestroy() {
    this.$iframeSubscription.unsubscribe();
  }

  private removeLiveChatInIframe(): void {
    const observer = new MutationObserver(() => {
      const liveChat = this.document.getElementById('chat-widget-container');
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
