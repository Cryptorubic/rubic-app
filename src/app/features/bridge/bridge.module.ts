import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { BridgeService } from 'src/app/features/bridge/services/bridge-service/bridge.service';
import { EthereumBinanceBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { EthereumXdaiBridgeProviderService } from 'src/app/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-xdai-bridge-provider/ethereum-xdai-bridge-provider.service';
import { BridgeBottomFormComponent } from './components/bridge-bottom-form/bridge-bottom-form.component';
import { BinancePolygonBridgeProviderService } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-bridge-provider.service';
import { BinancePolygonRubicBridgeProviderService } from '@features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-rubic-bridge-provider/binance-polygon-rubic-bridge-provider.service';

@NgModule({
  declarations: [BridgeBottomFormComponent],
  exports: [BridgeBottomFormComponent],
  imports: [CommonModule, SharedModule],
  providers: [
    BridgeService,
    EthereumBinanceBridgeProviderService,
    EthereumBinanceRubicBridgeProviderService,
    EthereumXdaiBridgeProviderService,
    BinancePolygonBridgeProviderService,
    BinancePolygonRubicBridgeProviderService
  ]
})
export class BridgeModule {}
