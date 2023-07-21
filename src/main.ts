import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { ENVIRONMENT } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://be105287a955499ca84ade87b6f02890@o4504752673062912.ingest.sentry.io/4504752674570240',
  integrations: [
    new BrowserTracing({
      tracePropagationTargets: [
        'https://local.rubic.exchange:4224',
        ENVIRONMENT.apiTokenUrl,
        'https:' + ENVIRONMENT.apiBaseUrl
      ],
      routingInstrumentation: Sentry.routingInstrumentation
    })
  ],
  tracesSampleRate: 1.0,
  environment: ENVIRONMENT.production ? 'production' : 'develop'
});

if (ENVIRONMENT.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
