// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';

export const environment = {
  production: false,
  apiBaseUrl: '//dev-api.rubic.exchange/api',
  zrxAffiliateAddress: undefined as string,
  crossChain: {
    apiBaseUrl: 'https://dev-crosschain.rubic.exchange/api',
    contractAddresses: {
      [BLOCKCHAIN_NAME.ETHEREUM]: undefined as string,
      [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: '0x6b8904739059afbaa91311aab99187f5885c6dc0',
      [BLOCKCHAIN_NAME.POLYGON]: '0xb02c0b6ba0e7719de2d44e613fc4ad01ac2f60ad',
      [BLOCKCHAIN_NAME.AVALANCHE]: '0x3645dca27d9f5cf5ee0d6f52ee53ae366e4ceac2'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
