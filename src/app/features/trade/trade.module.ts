import { NgModule } from '@angular/core';
import { TradeRoutingModule } from '@features/trade/trade-routing.module';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';
import {
  TuiButtonModule,
  TuiExpandModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiNotificationModule,
  TuiModeModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import {
  TuiCarouselModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiTagModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import { AssetsSelectorModule } from '@features/trade/components/assets-selector/assets-selector.module';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';
import { FormsTogglerService } from './services/forms-toggler/forms-toggler.service';
import { TradeInfoManager } from './services/trade-info-manager/trade-info-manager.service';
import { DepositService } from './services/deposit/deposit.service';
import { AlternativeRoutesService } from './services/alternative-route-api-service/alternative-routes.service';
import { RefundService } from './services/refund-service/refund.service';
import { SolanaGaslessService } from './services/solana-gasless/solana-gasless.service';
import { SolanaGaslessStateService } from './services/solana-gasless/solana-gasless-state.service';
import { SharedTradeModule } from '@features/trade/shared-trade.module';

@NgModule({
  declarations: [],
  exports: [],
  imports: [
    TradeRoutingModule,
    CommonModule,
    SharedModule,
    TuiExpandModule,
    TuiScrollbarModule,
    TuiTagModule,
    InlineSVGModule,
    TuiButtonModule,
    ClipboardModule,
    ReactiveFormsModule,
    TuiHintModule,
    FormsModule,
    TuiTextfieldControllerModule,
    TuiInputNumberModule,
    TuiToggleModule,
    TuiHostedDropdownModule,
    TuiInputModule,
    TuiLoaderModule,
    AssetsSelectorModule,
    TuiNotificationModule,
    TuiModeModule,
    TuiCarouselModule,
    SharedTradeModule
  ],
  providers: [
    SwapsStateService,
    SwapsControllerService,
    SwapFormQueryService,
    CrossChainService,
    OnChainService,
    CrossChainApiService,
    SettingsService,
    TargetNetworkAddressService,
    RefreshService,
    PreviewSwapService,
    OnChainApiService,
    DepositService,
    ActionButtonService,
    FormsTogglerService,
    TradeInfoManager,
    FormsTogglerService,
    AlternativeRoutesService,
    RefundService,
    SolanaGaslessService,
    SolanaGaslessStateService
  ]
})
export class TradeModule {}
