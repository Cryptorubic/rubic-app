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
      org: 'rubic', //process.env.SENTRY_ORG,
      project: 'internal', //process.env.SENTRY_PROJECT,
      authToken:
        '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', //process.env.SENTRY_AUTH_TOKEN,
      bundleSizeOptimizations: {
        excludeReplayIframe: true,
        excludeReplayShadowDom: true,
        excludeReplayWorker: true
      }
    })
  );

  return config;
};
