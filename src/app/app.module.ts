import { provideEventPlugins } from '@taiga-ui/event-plugins';
import { BrowserModule, Meta } from '@angular/platform-browser';
import { ErrorHandler, Inject, NgModule, provideAppInitializer, inject } from '@angular/core';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  withXsrfConfiguration
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TuiRoot, TuiAlert, TuiDialog, tuiHintOptionsProvider } from '@taiga-ui/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { DOCUMENT, ViewportScroller } from '@angular/common';
import { filter, pairwise, share } from 'rxjs/operators';
import { CoreModule } from '@core/core.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxGoogleAnalyticsModule } from '@hakimio/ngx-google-analytics';
import * as Sentry from '@sentry/angular';
import { privacyInitializer } from './features/privacy/utils/privacy-initializer';
import { PrivateLocalStorageService } from './features/privacy/services/privacy-local-storage.service';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    SharedModule,
    TuiRoot,
    TuiAlert,
    TuiDialog,
    AppRoutingModule,
    NgxGoogleAnalyticsModule
  ],
  providers: [
    provideAppInitializer(() => {
      const initializerFn = (() => () => {})();
      return initializerFn();
    }),
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler()
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    provideAppInitializer(() => {
      inject(Sentry.TraceService);
    }),
    provideAppInitializer(() => {
      const initializerFn = privacyInitializer(inject(PrivateLocalStorageService));
      return initializerFn();
    }),
    provideEventPlugins(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withXsrfConfiguration({
        cookieName: 'csrftoken',
        headerName: 'X-CSRFToken'
      })
    ),
    tuiHintOptionsProvider({ appearance: 'dark' })
  ]
})
export class AppModule {
  constructor(
    private readonly router: Router,
    private readonly viewportScroller: ViewportScroller,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly meta: Meta
  ) {
    this.setScrollStrategy();
    this.setCanonicalTag();
  }

  private readonly routerEvents$ = this.router.events.pipe(share());

  /**
   * Defines scroll strategy, when page url is changed.
   * Doesn't scroll if only query parameters are changed.
   */
  private setScrollStrategy(): void {
    this.routerEvents$
      .pipe(
        filter((e): e is Scroll => e instanceof Scroll),
        pairwise()
      )
      .subscribe(([prevEvent, event]: [Scroll, Scroll]) => {
        if (event.position) {
          // backward navigation
          this.viewportScroller.scrollToPosition(event.position);
        } else if (event.anchor) {
          // anchor navigation
          this.viewportScroller.scrollToAnchor(event.anchor);
        } else if (
          prevEvent.routerEvent instanceof NavigationEnd &&
          event.routerEvent instanceof NavigationEnd &&
          prevEvent.routerEvent.urlAfterRedirects.split('?')[0] !==
            event.routerEvent.urlAfterRedirects.split('?')[0]
        ) {
          // forward navigation
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      });
  }

  private setCanonicalTag(): void {
    this.routerEvents$.pipe(filter(e => e.type === 1)).subscribe((event: NavigationEnd) => {
      let canonicalTag = this.document.head.querySelector(`link[rel='canonical']`);
      const isParamsExists = this.router.routerState.snapshot.root.queryParams?.fromChain;

      if (!canonicalTag) {
        canonicalTag = this.document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        this.document.head.appendChild(canonicalTag);
      }

      if (isParamsExists) {
        canonicalTag.setAttribute('href', `https://app.rubic.exchange/`);
        this.meta.updateTag({ name: 'robots', content: 'noindex' });
      } else {
        canonicalTag.setAttribute('href', `https://app.rubic.exchange${event.urlAfterRedirects}`);
        this.meta.updateTag({ name: 'robots', content: 'index,follow' });
      }
    });
  }
}
