import { BrowserModule, makeStateKey, StateKey, TransferState } from '@angular/platform-browser';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './index/header/header.component';
import { StartFormComponent, StartFormResolver } from './index/start-form/start-form.component';
import { IndexComponent } from './index/index.component';
import { HttpClient, HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  MatNativeDateModule,
  MatDatepickerModule,
  MatDialogModule,
  MatButtonModule
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { EthAddressDirective } from './directives/eth-address/eth-address.directive';
import {
  EtherscanUrlPipe,
  EthTokenValidatorDirective,
  NativeUrlPipe
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
  ContractsListResolver
} from './contracts-list/contracts-list.component';
import { FooterComponent } from './footer/footer.component';
import { PublicContractsComponent } from './index/public-contracts/public-contracts.component';
import { ClipboardModule } from 'ngx-clipboard';
import {
  BigNumberDirective,
  BigNumberFormat,
  BigNumberMax,
  BigNumberMin
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
import { TokenSaleComponent } from './token-sale/token-sale.component';
import { OneInchService } from './models/1inch/1inch';
import { DisclaimerComponent } from './components/disclaimer/disclaimer.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { TeamComponent } from './team/team.component';
import { TeamCardComponent } from './team/team-card/team-card.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { ModalComponent } from './components/modal/modal.component';
import { TradeInProgressModalComponent } from './index/trade-in-progress-modal/trade-in-progress-modal.component';
import { NgToggleModule } from 'ng-toggle-button';
import { BridgeFormComponent } from './bridge/brifge-form/bridge-form.component';
import { PrimaryButtonComponent } from './components/primary-button/primary-button.component';
import { TokensInputComponent } from './components/tokens-input/tokens-input.component';
import { BridgeComponent } from './bridge/bridge.component';
import { CollaborationsComponent } from './components/collaborations/collaborations.component';

import { ArrowComponent } from './components/arrow/arrow.component';
import { BridgeInProgressModalComponent } from './bridge/bridge-in-progress-modal/bridge-in-progress-modal.component';
import { BridgeSuccessComponent } from './bridge/bridge-success/bridge-success.component';
import { BridgeTableComponent } from './bridge/bridge-table/bridge-table.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DropdownSelectComponent } from './components/dropdown-select/dropdown-select.component';
import { WhiteButtonComponent } from './components/white-button/white-button.component';
import { TokenLabelComponent } from './components/tokens-input/token-label/token-label.component';
import { InputDropdownComponent } from './components/input-dropdown/input-dropdown.component';
import { DynamicModule } from 'ng-dynamic-component';
import { BlockchainsInputComponent } from './components/blockchains-input/blockchains-input.component';
import { BlockchainLabelComponent } from './components/blockchains-input/blockchain-label/blockchain-label.component';
import { AddressInputComponent } from './components/address-input/address-input.component';
import { NetworkErrorComponent } from './bridge/bridge-errors/network-error/network-error.component';
import { TradeSuccessModalComponent } from './index/trade-success-modal/trade-success-modal.component';
import { TooltipComponent } from './components/tooltip/tooltip.component';

export class TranslateBrowserLoader implements TranslateLoader {
  constructor(
    private prefix: string = 'i18n',
    private suffix: string = '.json',
    private transferState: TransferState,
    private http: HttpClient
  ) {}

  public getTranslation(lang: string): Observable<any> {
    const key: StateKey<number> = makeStateKey<number>('transfer-translate-' + lang);
    const data = this.transferState.get(key, null);

    // First we are looking for the translations in transfer-state, if none found, http load as fallback
    if (data) {
      return Observable.create(observer => {
        observer.next(data);
        observer.complete();
      });
    } else {
      return new TranslateHttpLoader(this.http, this.prefix, this.suffix).getTranslation(lang);
    }
  }
}

export function exportTranslateStaticLoader(http: HttpClient, transferState: TransferState) {
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
  httpService: HttpService,
  injector: Injector
) {
  const defaultLng = (navigator.language || navigator['browserLanguage']).split('-')[0];

  const langToSet =
    window['jQuery']['cookie']('lng') ||
    (['en', 'ko'].indexOf(defaultLng) > -1 ? defaultLng : 'en');

  return () =>
    new Promise<any>((resolve: any, reject) => {
      const oneInchService = injector.get(OneInchService, Promise.resolve(null));

      translate.setDefaultLang('en');

      translate.use(langToSet).subscribe(() => {
        const subscriber = userService.getCurrentUser(true).subscribe(() => {
          httpService
            .get('coingecko_tokens/')
            .toPromise()
            .then(result => {
              let tokens = result.tokens;
              tokens = tokens.sort((a, b) => {
                const aRank = a.coingecko_rank || 100000;
                const bRank = b.coingecko_rank || 100000;
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
    DisclaimerComponent,
    MessageBoxComponent,
    TeamComponent,
    TeamCardComponent,
    MaintenanceComponent,
    ModalComponent,
    TradeInProgressModalComponent,
    BridgeFormComponent,
    PrimaryButtonComponent,
    TokensInputComponent,
    BridgeComponent,
    CollaborationsComponent,
    ArrowComponent,
    BridgeInProgressModalComponent,
    BridgeSuccessComponent,
    BridgeTableComponent,
    SpinnerComponent,
    DropdownSelectComponent,
    WhiteButtonComponent,
    TokenLabelComponent,
    InputDropdownComponent,
    BlockchainsInputComponent,
    BlockchainLabelComponent,
    AddressInputComponent,
    NetworkErrorComponent,
    TradeSuccessModalComponent,
    TooltipComponent
  ],
  entryComponents: [AuthComponent, ChangePasswordComponent, DisclaimerComponent],
  imports: [
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
    ])
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
