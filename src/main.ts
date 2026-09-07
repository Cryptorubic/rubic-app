import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import { initGoogleAnalytics } from './google-analytics-init';

if (ENVIRONMENT.production) {
  enableProdMode();
}

platformBrowser()
  .bootstrapModule(AppModule)
  .then(() => {
    requestIdleCallback(async () => {
      const { initSentry } = await import('./sentry-init-config');
      initSentry();
      initGoogleAnalytics();
    });
  })
  .catch(err => console.error(err));
