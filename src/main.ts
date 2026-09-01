import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import { initGoogleAnalytics } from './google-analytics-init';
import { initSentry } from './sentry-init-config';

if (ENVIRONMENT.production) {
  enableProdMode();
}

platformBrowser()
  .bootstrapModule(AppModule)
  .then(() => {
    initSentry();
    initGoogleAnalytics();
  })
  .catch(err => console.error(err));
