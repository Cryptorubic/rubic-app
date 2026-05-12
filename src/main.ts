import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { ENVIRONMENT } from './environments/environment';
import { initGoogleAnalytics } from './google-analytics-init';
import { initSentry } from './sentry-init-config';
import { getMultichainClient, getDefaultTransport } from '@metamask/multichain-api-client';
import { registerBitcoinWalletStandard } from '@metamask/bitcoin-wallet-standard';

if (ENVIRONMENT.production) {
  enableProdMode();
}

//TODO: remove manual wallet registration when it will be implemented in metamask extension
const client = getMultichainClient({ transport: getDefaultTransport() });
registerBitcoinWalletStandard({ client });

initSentry();
initGoogleAnalytics();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
