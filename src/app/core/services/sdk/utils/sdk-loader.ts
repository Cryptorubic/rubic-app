import { SdkLoaderService } from '@core/services/sdk/sdk-loader.service';

export function sdkLoader(sdkLoaderService: SdkLoaderService) {
  return () => sdkLoaderService.initSdk();
}
