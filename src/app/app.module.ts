import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { DynamicModule } from 'ng-dynamic-component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { TuiDialogModule, TuiNotificationsModule, TuiRootModule } from '@taiga-ui/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { DisclaimerComponent } from './shared/components/disclaimer/disclaimer.component';
import { TokenLabelComponent } from './shared/components/tokens-input/token-label/token-label.component';
import { ListingRequestPopupComponent } from './shared/components/collaborations/listing-request-popup/listing-request-popup.component';
import { NetworkErrorComponent } from './shared/components/network-error/network-error.component';
import { TotalSupplyOverflowErrorComponent } from './shared/components/errors/total-supply-overflow-error/total-supply-overflow-error.component';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [DisclaimerComponent],
  imports: [
    CoreModule,
    SharedModule,
    TuiRootModule,
    TuiNotificationsModule,
    TuiDialogModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken'
    }),
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    DynamicModule.withComponents([
      TokenLabelComponent,
      NetworkErrorComponent,
      ListingRequestPopupComponent,
      TotalSupplyOverflowErrorComponent
    ]),
    NgxMaterialTimepickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
