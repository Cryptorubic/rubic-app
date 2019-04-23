import { BrowserModule } from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './index/header/header.component';
import { StartFormComponent } from './index/start-form/start-form.component';
import { IndexComponent } from './index/index.component';
import { TokenInputComponent } from './directives/token-input/token-input.component';
import {HttpClient, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ContractEditResolver, ContractFormComponent} from './contract-form/contract-form.component';
import {MatNativeDateModule, MatDatepickerModule, MAT_DATE_FORMATS, MatDialogModule, MatButtonModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';
import { EthAddressDirective } from './directives/eth-address/eth-address.directive';
import {EtherscanUrlPipe, EthTokenValidatorDirective} from './services/web3/web3.service';
import {UserService} from './services/user/user.service';
import {UserInterface} from './services/user/user.interface';
import {AuthComponent} from './common/auth/auth.component';
import {AuthenticationComponent} from './common/auth/authentication/authentication.component';
import {RegistrationComponent} from './common/auth/registration/registration.component';
import {SocialComponent} from './common/auth/social/social.component';
import {EmailConfirmComponent} from './common/auth/email-confirm/email-confirm.component';
import {ForgotPasswordComponent} from './common/auth/forgot-password/forgot-password.component';
import { ContractFormPayComponent } from './contract-form/contract-form-pay/contract-form-pay.component';
import { ContractPreviewComponent } from './contract-preview/contract-preview.component';
import { TransactionComponent } from './transaction/transaction.component';
import {ContractsListComponent, ContractsListResolver} from './contracts-list/contracts-list.component';
import { FooterComponent } from './footer/footer.component';
import { PublicContractsComponent } from './index/public-contracts/public-contracts.component';
import { NgScrollbarModule } from 'ngx-scrollbar';
import {ClipboardModule} from 'ngx-clipboard';
import { ContractFormTwoComponent } from './contract-form-two/contract-form-two.component';
import {BigNumberDirective, BigNumberFormat} from './directives/big-number/big-number.directive';
import { ContractPreviewTwoComponent } from './contract-preview-two/contract-preview-two.component';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

export function appInitializerFactory(translate: TranslateService, userService: UserService) {
  return () => new Promise<any>((resolve: any, reject) => {
    const subscriber = userService.getCurrentUser(true).subscribe((user: UserInterface) => {
      translate.use(user.lang).subscribe(() => {
        resolve(null);
      }, () => {
        resolve(null);
      });
      subscriber.unsubscribe();
    });
  });
}




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    StartFormComponent,
    IndexComponent,
    TokenInputComponent,
    ContractFormComponent,
    EthAddressDirective,
    EthTokenValidatorDirective,
    RegistrationComponent,
    AuthComponent,
    AuthenticationComponent,
    SocialComponent,
    EmailConfirmComponent,
    ForgotPasswordComponent,
    ContractFormPayComponent,
    ContractPreviewComponent,
    TransactionComponent,
    ContractsListComponent,
    EtherscanUrlPipe,
    FooterComponent,
    BigNumberFormat,
    PublicContractsComponent,
    ContractFormTwoComponent,
    BigNumberDirective,
    ContractPreviewTwoComponent
  ],
  entryComponents: [
    AuthComponent,
    TransactionComponent
  ],
  imports: [
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      }
    ),

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
    NgScrollbarModule,
    ClipboardModule
  ],
  providers: [
    ContractEditResolver,
    ContractsListResolver,
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [
        TranslateService, UserService
      ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
