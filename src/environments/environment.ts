// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { STAKING_CONFIG_DEVELOP } from './constants/staking';

export const ENVIRONMENT = {
  production: false,
  apiBaseUrl: '//testnet-api.rubic.exchange/api',
  apiTokenUrl: 'https://testnet-tokens.rubic.exchange/api',
  websocketBaseUrl: 'wss://dev-api.rubic.exchange/ws',

  staking: STAKING_CONFIG_DEVELOP,

  zrxAffiliateAddress: undefined as string,
  onramperApiKey: 'pk_prod_01H03RG3KT4TEKY80D82R1N4ZS'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error'; // Included with Angular CLI.
