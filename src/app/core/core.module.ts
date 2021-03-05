import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule } from '@angular/router';
import { ContractsListResolver } from '../contracts-list/contracts-list.reslover';
import { ContractEditV3Resolver } from '../contracts-preview-v3/contracts-preview-v3.resolver';
import { StartFormResolver } from '../index/start-form/start-form.component';
import { HttpService } from '../services/http/http.service';
import { UserService } from '../services/user/user.service';
import { OneInchService } from '../models/1inch/1inch';
import { MaintenanceComponent } from './components/maintenance/maintenance.component';
import { SharedModule } from '../shared/shared.module';
import { HeaderComponent } from './components/header/header.component';

export function appInitializerFactory(
  translate: TranslateService,
  userService: UserService,
  httpService: HttpService,
  injector: Injector
) {
  const defaultLng = (navigator.language || navigator['browserLanguage']).split('-')[0];

  const langToSet =
    window['jQuery'].cookie('lng') || (['en', 'ko'].indexOf(defaultLng) > -1 ? defaultLng : 'en');

  return () =>
    new Promise<any>((resolve: any) => {
      const oneInchService = injector.get(OneInchService, Promise.resolve(null));

      translate.setDefaultLang('en');

      translate.use(langToSet).subscribe(() => {
        const subscriber = userService.getCurrentUser(true).subscribe(() => {
          httpService
            .get('coingecko_tokens/')
            .toPromise()
            .then(result => {
              let { tokens } = result;
              tokens = tokens.sort((a, b) => {
                const aRank = a.coingecko_rank || 100000;
                const bRank = b.coingecko_rank || 100000;
                // eslint-disable-next-line no-nested-ternary
                return aRank > bRank ? 1 : aRank < bRank ? -1 : 0;
              });

              window['coingecko_tokens'] = tokens;
              oneInchService.onLoadTokens().subscribe(() => {
                document.getElementById('spring-spinner').remove();
                resolve(null);
              });
            })
            .catch(e => {
              console.error('Loading error');
              console.error(e);
              window['coingecko_tokens'] = [];
              oneInchService.onLoadTokens().subscribe(() => {
                document.getElementById('spring-spinner').remove();
                resolve(null);
              });
            });

          subscriber.unsubscribe();
        });
      });
    });
}

@NgModule({
  declarations: [MaintenanceComponent, HeaderComponent],
  providers: [
    CookieService,
    ContractsListResolver,
    ContractEditV3Resolver,
    StartFormResolver,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, UserService, HttpService, Injector],
      multi: true
    }
  ],
  imports: [CommonModule, SharedModule, TranslateModule, RouterModule],
  exports: [MaintenanceComponent, HeaderComponent, RouterModule]
})
export class CoreModule {}
