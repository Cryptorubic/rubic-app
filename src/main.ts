import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';

import * as Sentry from '@sentry/angular-ivy';

if (ENVIRONMENT.production) {
  Sentry.init({
    dsn: 'https://392a099caecf60ce2837cb2c2127964c@o4507151825305600.ingest.de.sentry.io/4507151836184656',
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1.0,
    tracePropagationTargets: [ENVIRONMENT.apiTokenUrl, 'https:' + ENVIRONMENT.apiBaseUrl],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: 'production'
  });

  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
