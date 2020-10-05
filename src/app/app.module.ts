import {
  BrowserModule,
  makeStateKey,
  StateKey,
  TransferState,
} from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './index/header/header.component';
import { StartFormComponent } from './index/start-form/start-form.component';
import { IndexComponent } from './index/index.component';
import {
  HttpClient,
  HttpClientModule,
  HttpClientXsrfModule,
} from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatNativeDateModule,
  MatDatepickerModule,
  MatDialogModule,
  MatButtonModule,
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EthAddressDirective } from './directives/eth-address/eth-address.directive';
import {
  EtherscanUrlPipe,
  EthTokenValidatorDirective, NativeUrlPipe,
} from './services/web3/web3.service';
import { UserService } from './services/user/user.service';
import { UserInterface } from './services/user/user.interface';
import { AuthComponent } from './common/auth/auth.component';
import { AuthenticationComponent } from './common/auth/authentication/authentication.component';
import { RegistrationComponent } from './common/auth/registration/registration.component';
import { SocialComponent } from './common/auth/social/social.component';
import { EmailConfirmComponent } from './common/auth/email-confirm/email-confirm.component';
import { ForgotPasswordComponent } from './common/auth/forgot-password/forgot-password.component';
import {
  ContractsListComponent,
  ContractsListResolver,
} from './contracts-list/contracts-list.component';
import { FooterComponent } from './footer/footer.component';
import { PublicContractsComponent } from './index/public-contracts/public-contracts.component';
import { ClipboardModule } from 'ngx-clipboard';
import {
  BigNumberDirective,
  BigNumberFormat,
  BigNumberMax,
  BigNumberMin,
} from './directives/big-number/big-number.directive';
import { FaqComponent } from './faq-component/faq.component';
import { MinMaxDirective } from './directives/minMax/min-max.directive';
import { CookieService } from 'ngx-cookie-service';
import { ContactsComponent } from './contacts-component/contacts.component';
import { TokensAllInputComponent } from './directives/tokens-all-input/tokens-all-input.component';
import { HttpService } from './services/http/http.service';
import {
  ContractEditV3Resolver,
  ContractsPreviewV3Component
} from './contracts-preview-v3/contracts-preview-v3.component';
import { OwlModule } from 'ngx-owl-carousel';
import { Observable } from 'rxjs';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { CoinsListComponent } from './directives/coins-list/coins-list.component';
import { ChangePasswordComponent } from './common/change-password/change-password.component';
import { MainPageComponent } from './main-page/main-page.component';
import { HeaderMainPageComponent } from './main-page/header/header.component';
import { FooterMainPageComponent } from './main-page/footer/footer.component';
import { AboutageComponent } from './about/about.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import {TokenSaleComponent} from "./token-sale/token-sale.component";

export class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    private prefix: string = 'i18n',
    private suffix: string = '.json',
    private transferState: TransferState,
    private http: HttpClient
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const key: StateKey<number> = makeStateKey<number>(
      'transfer-translate-' + lang
    );
    const data = this.transferState.get(key, null);

    // First we are looking for the translations in transfer-state, if none found, http load as fallback
    if (data) {
      return Observable.create((observer) => {
        observer.next(data);
        observer.complete();
      });
    } else {
      return new TranslateHttpLoader(
        this.http,
        this.prefix,
        this.suffix
      ).getTranslation(lang);
    }
  }
}

export function exportTranslateStaticLoader(
  http: HttpClient,
  transferState: TransferState
) {
  return new TranslateBrowserLoader(
    './assets/i18n/',
    '.json?_t=' + new Date().getTime(),
    transferState,
    http
  );
}

export function appInitializerFactory(
  translate: TranslateService,
  userService: UserService,
  httpService: HttpService
) {
  const defaultLng = (navigator.language || navigator['browserLanguage']).split(
    '-'
  )[0];

  const langToSet =
    window['jQuery']['cookie']('lng') ||
    (['en', 'zh', 'ko', 'ru'].indexOf(defaultLng) > -1 ? defaultLng : 'en');

  return () =>
    new Promise<any>((resolve: any, reject) => {
      translate.setDefaultLang('en');

      translate.use(langToSet).subscribe(() => {
        const subscriber = userService
          .getCurrentUser(true)
          .subscribe((user: UserInterface) => {
            httpService
              .get('get_coinmarketcap_tokens/')
              .toPromise()
              .then((tokens) => {
                tokens = tokens.sort((a, b) => {
                  const aRank = a.rank || 100000;
                  const bRank = b.rank || 100000;
                  return aRank > bRank ? 1 : aRank < bRank ? -1 : 0;
                });

                tokens.forEach((token) => {
                  token.platform =
                    token.platform !== 'False' ? token.platform : false;
                  if (
                    !token.platform &&
                    token.token_short_name === 'ETH' &&
                    token.token_name === 'Ethereum'
                  ) {
                    token.platform = 'ethereum';
                    token.isEther = true;
                    token.decimals = 18;
                  } else if (token.platform !== 'fiat') {
                    token.decimals = 8;
                  } else {
                    token.decimals = 2;
                    token.address = token.token_short_name;
                  }
                  token.platform =
                    token.platform || token.token_name.toLowerCase();
                  token.isEthereum = !!(
                    token.platform === 'ethereum' && token.address
                  );
                });
                window['cmc_tokens'] = tokens;
                resolve(null);
              });

            subscriber.unsubscribe();
          });
      });
    });
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    StartFormComponent,
    AboutageComponent,
    IndexComponent,
    FooterMainPageComponent,
    HeaderMainPageComponent,
    MainPageComponent,
    EthAddressDirective,
    EthTokenValidatorDirective,
    RegistrationComponent,
    AuthComponent,
    AuthenticationComponent,
    SocialComponent,
    EmailConfirmComponent,
    ForgotPasswordComponent,
    ContractsListComponent,
    EtherscanUrlPipe,
    NativeUrlPipe,
    FooterComponent,
    BigNumberFormat,
    BigNumberMin,
    BigNumberMax,
    PublicContractsComponent,
    BigNumberDirective,

    MinMaxDirective,
    FaqComponent,
    ContactsComponent,
    TokensAllInputComponent,
    ContractsPreviewV3Component,
    CoinsListComponent,
    ChangePasswordComponent,
    TokenSaleComponent,
    CountdownComponent,
  ],
  entryComponents: [
    AuthComponent,
    ChangePasswordComponent,
  ],
  imports: [
    TransferHttpCacheModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: exportTranslateStaticLoader,
        deps: [HttpClient, TransferState],
      },
    }),

    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken',
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
  ],
  providers: [
    CookieService,
    ContractsListResolver,
    ContractEditV3Resolver,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, UserService, HttpService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
