import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import * as Sentry from '@sentry/angular';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: 'https://36d080c3f1b145c2a9604211cf2a7cc5@o4504179175981056.ingest.sentry.io/4504179177160704',
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
