import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs';

export default (
  config: webpack.Configuration,
  _: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  if (targetOptions.configuration === 'sdk') {
    const sdkDirectory = '../rubic-sdk/';
    const sdkDirectoryExists = fs.existsSync(sdkDirectory);

    const sdkBundle = '../rubic-sdk/dist/rubic-sdk.min.js';
    const sdkBundleExists = fs.existsSync(sdkBundle);

    if (sdkDirectoryExists) {
      if (sdkBundleExists) {
        config.resolve.fallback = {
          zlib: false
        };
        config.resolve.alias = {
          ...config.resolve.alias,
          'rubic-sdk': path.resolve(__dirname, sdkDirectory)
        };
      } else {
        throw new Error(
          `SDK bundle is not found. Run 'yarn build & yarn compile' in sdk directory first.`
        );
      }
    } else {
      throw new Error(
        'Rubic SDK directory is not exists. Clone Rubic SDK repo to ./rubic-sdk/ directory.'
      );
    }
  }

  return config;
};
