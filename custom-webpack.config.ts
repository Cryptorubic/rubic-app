import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as path from 'path';

export default (
  config: webpack.Configuration,
  _: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  if (targetOptions.configuration === 'sdk') {
    config.resolve.alias = {
      ...config.resolve.alias,
      'rubic-sdk': path.resolve(__dirname, '../rubic-sdk/')
    };
  }

  return config;
};
