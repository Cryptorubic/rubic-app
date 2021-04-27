import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { InlineSVGModule } from 'ng-inline-svg';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BridgePageRoutingModule } from './bridge-page-routing.module';
import { BridgeComponent } from './components/bridge/bridge.component';
import { BridgeService } from './services/bridge.service';
import { BridgeSectionComponent } from './components/bridge-section/bridge-section.component';
import { BridgeFormComponent } from './components/brifge-form/bridge-form.component';
import { BridgeInProgressModalComponent } from './components/dialogs/bridge-in-progress-modal/bridge-in-progress-modal.component';
import { BridgeSuccessComponent } from './components/dialogs/bridge-success/bridge-success.component';
import { BridgeTableComponent } from './components/bridge-table/bridge-table.component';
import { AdvertModalComponent } from './components/dialogs/advert-modal/advert-modal.component';
import { WarningModalComponent } from './components/dialogs/warning-modal/warning-modal.component';
import { BinanceBridgeProviderService } from './services/blockchain-bridge-provider/binance-bridge-provider/binance-bridge-provider.service';
import { PanamaBridgeProviderService } from './services/blockchain-bridge-provider/binance-bridge-provider/panama-bridge-provider/panama-bridge-provider.service';
import { RubicBridgeProviderService } from './services/blockchain-bridge-provider/binance-bridge-provider/rubic-bridge-provider/rubic-bridge-provider.service';
import { PolygonBridgeProviderService } from './services/blockchain-bridge-provider/polygon-bridge-provider/polygon-bridge-provider.service';
import { ReceiveButtonComponent } from './components/bridge-table/deposit-button/receive-button.component';

@NgModule({
  declarations: [
    BridgeFormComponent,
    BridgeComponent,
    BridgeInProgressModalComponent,
    BridgeSuccessComponent,
    BridgeTableComponent,
    AdvertModalComponent,
    WarningModalComponent,
    ReceiveButtonComponent,
    BridgeSectionComponent
  ],
  imports: [
    CommonModule,
    BridgePageRoutingModule,
    SharedModule,
    TranslateModule,
    MatDialogModule,
    HttpClientModule,
    InlineSVGModule.forRoot(),
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [MatFormFieldModule, MatInputModule],
  providers: [
    BridgeService,
    BinanceBridgeProviderService,
    PanamaBridgeProviderService,
    RubicBridgeProviderService,
    PolygonBridgeProviderService
  ]
})
export class BridgePageModule {}
