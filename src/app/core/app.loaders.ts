import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CookieService } from 'ngx-cookie-service';
import { ContentLoaderService } from './services/content-loader/content-loader.service';

class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    private prefix: string = 'i18n',
    private suffix: string = '.json',
    private transferState: TransferState,
    private http: HttpClient
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const key: StateKey<number> = makeStateKey<number>(`transfer-translate-${lang}`);
    const data = this.transferState.get(key, null);

    // First we are looking for the translations in transfer-state, if none found, http load as fallback
    if (data) {
      return Observable.create(observer => {
        observer.next(data);
        observer.complete();
      });
    }
    return new TranslateHttpLoader(this.http, this.prefix, this.suffix).getTranslation(lang);
  }
}

export function translateStaticLoader(http: HttpClient, transferState: TransferState) {
  return new TranslateBrowserLoader(
    './assets/i18n/',
    `.json?_t=${new Date().getTime()}`,
    transferState,
    http
  );
}

export function languageLoader(translate: TranslateService, cookieService: CookieService) {
  const userRegionLanguage = navigator.language?.split('-')[0];
  const lng = cookieService.get('lng') || userRegionLanguage || 'en';
  translate.setDefaultLang(lng);
  return () => translate.use(lng).toPromise();
}

export function configLoader(contentLoaderService: ContentLoaderService) {
  return () => contentLoaderService.fetchContent();
}
