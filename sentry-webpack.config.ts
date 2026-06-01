import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import { sentryWebpackPlugin } from '@sentry/webpack-plugin';

import * as webpack from 'webpack';

const PROD_LIKE_CONFIGS = new Set(['production', 'stage', 'prod-api']);

export default (
  config: webpack.Configuration,
  _: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  const configuration = targetOptions.configuration ?? '';

  if (!PROD_LIKE_CONFIGS.has(configuration)) {
    config.devtool = false;
    return config;
  }

  config.devtool = 'source-map';
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    sentryWebpackPlugin({
      org: 'rubic',
      project: 'rubic-app',
      authToken:
        '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',
      bundleSizeOptimizations: {
        excludeReplayIframe: true,
        excludeReplayShadowDom: true,
        excludeReplayWorker: true
      }
    })
  );

  return config;
};
