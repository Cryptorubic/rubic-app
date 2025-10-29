import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: 'https://28830c940f3cd986b5bc9662943aeaa5@sentry.rubic.exchange/1',
  sendDefaultPii: true,
  enableLogs: true
});

if (ENVIRONMENT.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
