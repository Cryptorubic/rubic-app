import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { BridgeService } from '@features/swaps/features/bridge/services/bridge-service/bridge.service';
import { EthereumBinanceBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/ethereum-binance-bridge-provider.service';
import { EthereumBinanceRubicBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/ethereum-binance-bridge-provider/rubic-bridge-provider/ethereum-binance-rubic-bridge-provider.service';
import { BridgeBottomFormComponent } from 'src/app/features/swaps/features/bridge/components/bridge-bottom-form/bridge-bottom-form.component';
import { BinancePolygonBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-bridge-provider.service';
import { BinancePolygonRubicBridgeProviderService } from '@features/swaps/features/bridge/services/bridge-service/blockchains-bridge-provider/binance-polygon-bridge-provider/binance-polygon-rubic-bridge-provider/binance-polygon-rubic-bridge-provider.service';
import { SwapButtonContainerModule } from '@features/swaps/shared/swap-button-container/swap-button-container.module';

@NgModule({
  declarations: [BridgeBottomFormComponent],
  exports: [BridgeBottomFormComponent],
  imports: [CommonModule, SharedModule, SwapButtonContainerModule],
  providers: [
    BridgeService,
    EthereumBinanceBridgeProviderService,
    EthereumBinanceRubicBridgeProviderService,
    BinancePolygonBridgeProviderService,
    BinancePolygonRubicBridgeProviderService
  ]
})
export class BridgeModule {}
