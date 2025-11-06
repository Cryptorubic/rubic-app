import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';

import * as webpack from 'webpack';

export default (
  config: webpack.Configuration,
  _: CustomWebpackBrowserSchema,
  __: TargetOptions
) => {
  config.devtool = 'source-map';
  config.plugins.push(
    sentryWebpackPlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      bundleSizeOptimizations: {
        excludeReplayIframe: true,
        excludeReplayShadowDom: true,
        excludeReplayWorker: true
      }
    })
  );

  return config;
};
