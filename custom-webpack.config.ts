import { CustomWebpackBrowserSchema, TargetOptions } from '@angular-builders/custom-webpack';
import * as webpack from 'webpack';
import * as path from 'path';
import * as fs from 'fs';

export default (
  config: webpack.Configuration,
  _: CustomWebpackBrowserSchema,
  targetOptions: TargetOptions
) => {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    querystring: require.resolve('querystring-es3'),
    zlib: require.resolve('browserify-zlib')
  };

  if (targetOptions.configuration === 'sdk') {
    const sdkDirectory = '../rubic-sdk/';
    const sdkDirectoryExists = fs.existsSync(sdkDirectory);

    const sdkBundle = '../rubic-sdk/dist/rubic-sdk.min.js';
    const sdkBundleExists = fs.existsSync(sdkBundle);

    if (sdkDirectoryExists) {
      if (sdkBundleExists) {
        config.resolve.alias = {
          ...config.resolve.alias,
          '@cryptorubic/sdk': path.resolve(__dirname, sdkDirectory)
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

  config.resolve.alias = {
    ...config.resolve.alias,
    '@walletconnect/ethereum-provider': path.resolve(
      __dirname,
      'node_modules/@walletconnect/ethereum-provider/dist/index.umd.js'
    ),
    'libsodium-wrappers': require.resolve('libsodium-wrappers-sumo'),
    '../../node_modules/ethers/lib/utils.mjs': path.resolve(
      __dirname,
      'node_modules/ethers/lib.esm/utils.js'
    )
  };

  return config;
};
