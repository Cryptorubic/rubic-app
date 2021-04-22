import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientXsrfModule } from '@angular/common/http';
import { DynamicModule } from 'ng-dynamic-component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { DisclaimerComponent } from './shared/components/disclaimer/disclaimer.component';
import { TokenLabelComponent } from './shared/components/tokens-input/token-label/token-label.component';
import { BlockchainLabelComponent } from './shared/components/blockchains-input/blockchain-label/blockchain-label.component';
import { NetworkErrorComponent } from './features/bridge-page/components/network-error/network-error.component';
import { ListingRequestPopupComponent } from './shared/components/collaborations/listing-request-popup/listing-request-popup.component';
import { TotalSupplyOverflowErrorComponent } from './shared/components/errors/total-supply-overflow-error/total-supply-overflow-error.component';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [DisclaimerComponent],
  imports: [
    CoreModule,
    SharedModule,
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
      BlockchainLabelComponent,
      NetworkErrorComponent,
      ListingRequestPopupComponent,
      TotalSupplyOverflowErrorComponent
    ]),
    NgxMaterialTimepickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
