import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';
import { PanamaBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/common/panama-bridge-provider/panama-bridge-provider.service';
import { EthereumBinanceBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinancePanamaBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/panama-bridge-provider/ethereum-binance-panama-bridge-provider.service';
import { EthereumTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-tron-bridge-provider/ethereum-tron-bridge-provider.service';
import { BinanceTronBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-tron-bridge-provider/binance-tron-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumPolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-polygon-bridge-provider/ethereum-polygon-bridge-provider.service';
import { EthereumXdaiBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-xdai-bridge-provider/ethereum-xdai-bridge-provider.service';
import { BinancePolygonBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-bridge-provider.service';
import { ReceiveWarningModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/receive-warning-modal/receive-warning-modal';
import { TrackTransactionModalComponent } from 'src/app/features/bridge/components/bridge-bottom-form/components/track-transaction-modal/track-transaction-modal';
import { BridgeBottomFormComponent } from './components/bridge-bottom-form/bridge-bottom-form.component';

@NgModule({
  declarations: [
    BridgeBottomFormComponent,
    ReceiveWarningModalComponent,
    TrackTransactionModalComponent
  ],
  exports: [BridgeBottomFormComponent],
  imports: [CommonModule, SharedModule],
  providers: [
    BridgeService,
    PanamaBridgeProviderService,
    EthereumBinanceBridgeProviderService,
    EthereumBinancePanamaBridgeProviderService,
    EthereumBinanceRubicBridgeProviderService,
    EthereumPolygonBridgeProviderService,
    EthereumTronBridgeProviderService,
    EthereumXdaiBridgeProviderService,
    BinanceTronBridgeProviderService,
    BinancePolygonBridgeProviderService
  ],
  entryComponents: [ReceiveWarningModalComponent, TrackTransactionModalComponent]
})
export class BridgeModule {}
