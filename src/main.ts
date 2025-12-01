import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import { initSentry } from './sentry-init-config';

if (ENVIRONMENT.production) {
  enableProdMode();
}

initSentry();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
