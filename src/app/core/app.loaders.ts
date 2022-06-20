import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ContentLoaderService } from './services/content-loader/content-loader.service';
import { SdkLoaderService } from '@core/services/sdk-loader/sdk-loader.service';

export function httpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', `.json?_t=${new Date().getTime()}`);
}

export function configLoader(contentLoaderService: ContentLoaderService) {
  return () => contentLoaderService.fetchContent();
}

export function sdkLoader(sdkLoaderService: SdkLoaderService) {
  return () => sdkLoaderService.initSdk();
}
