import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { InlineSVGModule } from 'ng-inline-svg';
import { HttpClientModule } from '@angular/common/http';
import { BridgePageRoutingModule } from './bridge-page-routing.module';
import { BridgeComponent } from './components/bridge/bridge.component';
import { BridgeService } from './services/bridge.service';
import { RubicBridgeService } from './services/rubic-bridge-service/rubic-bridge.service';
import { BridgeFormComponent } from './components/brifge-form/bridge-form.component';
import { BridgeInProgressModalComponent } from './components/dialogs/bridge-in-progress-modal/bridge-in-progress-modal.component';
import { BridgeSuccessComponent } from './components/dialogs/bridge-success/bridge-success.component';
import { BridgeTableComponent } from './components/bridge-table/bridge-table.component';
import { AdvertModalComponent } from './components/dialogs/advert-modal/advert-modal.component';
import { HighGasPriceModalComponent } from './components/dialogs/high-gas-price-modal/high-gas-price-modal.component';

@NgModule({
  declarations: [
    BridgeFormComponent,
    BridgeComponent,
    BridgeInProgressModalComponent,
    BridgeSuccessComponent,
    BridgeTableComponent,
    AdvertModalComponent,
    HighGasPriceModalComponent
  ],
  imports: [
    CommonModule,
    BridgePageRoutingModule,
    SharedModule,
    TranslateModule,
    MatDialogModule,
    HttpClientModule,
    InlineSVGModule.forRoot()
  ],
  providers: [BridgeService, RubicBridgeService]
})
export class BridgePageModule {}
