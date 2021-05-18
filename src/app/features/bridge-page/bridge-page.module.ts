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
import { FormsModule } from '@angular/forms';
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
import { EthereumBinanceBridgeProviderService } from './services/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinancePanamaBridgeProviderService } from './services/blockchains-bridge-provider/ethereum-binance-bridge-provider/panama-bridge-provider/ethereum-binance-panama-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from './services/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from './services/blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { ReceiveButtonComponent } from './components/bridge-table/deposit-button/receive-button.component';
import { EthereumTronBridgeProviderService } from './services/blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { BinanceTronBridgeProviderService } from './services/blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';
import { PanamaBridgeProviderService } from './services/blockchains-bridge-provider/common/panama-bridge-provider/panama-bridge-provider.service';
import { WalletAddressFormComponent } from './components/brifge-form/components/wallet-address-input/wallet-address-form.component';

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
    BridgeSectionComponent,
    WalletAddressFormComponent
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
    MatInputModule,
    FormsModule
  ],
  exports: [MatFormFieldModule, MatInputModule],
  providers: [
    BridgeService,
    PanamaBridgeProviderService,
    EthereumBinanceBridgeProviderService,
    EthereumBinancePanamaBridgeProviderService,
    EthereumBinanceRubicBridgeProviderService,
    EthereumPolygonBridgeProviderService,
    EthereumTronBridgeProviderService,
    BinanceTronBridgeProviderService
  ]
})
export class BridgePageModule {}
