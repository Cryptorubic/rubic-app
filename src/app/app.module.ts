import { BrowserModule, makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

import { HttpClient, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ClipboardModule } from 'ngx-clipboard';
import { CookieService } from 'ngx-cookie-service';
import { OwlModule } from 'ngx-owl-carousel';
import { Observable } from 'rxjs';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { NgToggleModule } from 'ng-toggle-button';
import { DynamicModule } from 'ng-dynamic-component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './index/header/header.component';
import { StartFormComponent, StartFormResolver } from './index/start-form/start-form.component';
import { IndexComponent } from './index/index.component';

import { UserService } from './services/user/user.service';
import { AuthComponent } from './common/auth/auth.component';
import { AuthenticationComponent } from './common/auth/authentication/authentication.component';
import { RegistrationComponent } from './common/auth/registration/registration.component';
import { SocialComponent } from './common/auth/social/social.component';
import { EmailConfirmComponent } from './common/auth/email-confirm/email-confirm.component';
import { ForgotPasswordComponent } from './common/auth/forgot-password/forgot-password.component';
import { ContractsListComponent } from './contracts-list/contracts-list.component';
import { PublicContractsComponent } from './index/public-contracts/public-contracts.component';

import { ContactsComponent } from './contacts-component/contacts.component';
import { HttpService } from './services/http/http.service';
import { ContractsPreviewV3Component } from './contracts-preview-v3/contracts-preview-v3.component';
import { ChangePasswordComponent } from './common/change-password/change-password.component';
import { MainPageComponent } from './main-page/main-page.component';
import { HeaderMainPageComponent } from './main-page/header/header.component';
import { FooterMainPageComponent } from './main-page/footer/footer.component';
import { TokenSaleComponent } from './token-sale/token-sale.component';
import { OneInchService } from './models/1inch/1inch';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { TradeInProgressModalComponent } from './index/trade-in-progress-modal/trade-in-progress-modal.component';
import { BridgeFormComponent } from './bridge/brifge-form/bridge-form.component';
import { BridgeComponent } from './bridge/bridge.component';
import { BridgeInProgressModalComponent } from './bridge/bridge-in-progress-modal/bridge-in-progress-modal.component';
import { BridgeSuccessComponent } from './bridge/bridge-success/bridge-success.component';
import { BridgeTableComponent } from './bridge/bridge-table/bridge-table.component';
import { NetworkErrorComponent } from './bridge/bridge-errors/network-error/network-error.component';
import { TradeSuccessModalComponent } from './index/trade-success-modal/trade-success-modal.component';
import { ContractsListResolver } from './contracts-list/contracts-list.reslover';
import { ContractEditV3Resolver } from './contracts-preview-v3/contracts-preview-v3.resolver';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { DisclaimerComponent } from './shared/components/disclaimer/disclaimer.component';
import { TokenLabelComponent } from './shared/components/tokens-input/token-label/token-label.component';
import { BlockchainLabelComponent } from './shared/components/blockchains-input/blockchain-label/blockchain-label.component';

export class TranslateBrowserLoader implements TranslateLoader {
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

export function exportTranslateStaticLoader(http: HttpClient, transferState: TransferState) {
  return new TranslateBrowserLoader(
    './assets/i18n/',
    `.json?_t=${new Date().getTime()}`,
    transferState,
    http
  );
}

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
  declarations: [
    AppComponent, // Here
    HeaderComponent, // Core
    StartFormComponent, // Startform Module ??
    IndexComponent, // Index module ??
    FooterMainPageComponent, // main page module
    HeaderMainPageComponent, // main page module
    MainPageComponent, // main page module
    RegistrationComponent, // Auth module
    AuthComponent, // Auth module
    AuthenticationComponent, // Auth module
    SocialComponent, // Auth module??
    EmailConfirmComponent, // Auth module
    ForgotPasswordComponent, // Auth module
    ContractsListComponent, // trades module
    PublicContractsComponent, // Index module ??
    ContactsComponent, // Doesn't used
    ContractsPreviewV3Component, // Trades module
    ChangePasswordComponent, // Auth module
    TokenSaleComponent, // Token-sale module ??
    MaintenanceComponent, // Core module ??
    TradeInProgressModalComponent, // start-form module ??
    BridgeFormComponent, // Bridge module
    BridgeComponent, // Bridge module
    BridgeInProgressModalComponent, // Bridge module
    BridgeSuccessComponent, // Bridge module
    BridgeTableComponent, // Bridge module
    NetworkErrorComponent, // Bridge module ??
    TradeSuccessModalComponent // startfoorm module ??
  ],
  entryComponents: [AuthComponent, ChangePasswordComponent, DisclaimerComponent],
  imports: [
    SharedModule,
    TransferHttpCacheModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: exportTranslateStaticLoader,
        deps: [HttpClient, TransferState]
      }
    }),

    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    MatDialogModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatButtonModule,
    BrowserAnimationsModule,
    NgxMaterialTimepickerModule,
    ClipboardModule,
    OwlModule,
    NgToggleModule,
    DynamicModule.withComponents([
      TokenLabelComponent,
      BlockchainLabelComponent,
      NetworkErrorComponent
    ]),
    CoreModule
  ],
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
  bootstrap: [AppComponent]
})
export class AppModule {}
