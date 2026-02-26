import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsSelectorModule } from '@features/trade/components/assets-selector/assets-selector.module';
import { SharedModule } from '@shared/shared.module';
import { TuiButtonModule } from '@taiga-ui/core';
import { PublicTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/public-tokens-selector/public-tokens-selector.component';
import { PrivateTokensSelectorComponent } from '@features/privacy/providers/shared-privacy-providers/components/private-tokens-selector/private-tokens-selector.component';
import { HideTokensWindowComponent } from '@features/privacy/providers/shared-privacy-providers/components/hide-tokens-window/hide-tokens-window.component';
import { SharedTradeModule } from '@features/trade/shared-trade.module';
import { SwapsFormService } from '@features/trade/services/swaps-form/swaps-form.service';
import { PreviewSwapService } from '@features/trade/services/preview-swap/preview-swap.service';
import { SwapsStateService } from '@features/trade/services/swaps-state/swaps-state.service';
import { SwapsControllerService } from '@features/trade/services/swaps-controller/swaps-controller.service';
import { SwapFormQueryService } from '@features/trade/services/swap-form-query/swap-form-query.service';
import { CrossChainService } from '@features/trade/services/cross-chain/cross-chain.service';
import { OnChainService } from '@features/trade/services/on-chain/on-chain.service';
import { CrossChainApiService } from '@features/trade/services/cross-chain-routing-api/cross-chain-api.service';
import { SettingsService } from '@features/trade/services/settings-service/settings.service';
import { TargetNetworkAddressService } from '@features/trade/services/target-network-address-service/target-network-address.service';
import { RefreshService } from '@features/trade/services/refresh-service/refresh.service';
import { OnChainApiService } from '@features/trade/services/on-chain-api/on-chain-api.service';
import { DepositService } from '@features/trade/services/deposit/deposit.service';
import { ActionButtonService } from '@features/trade/services/action-button-service/action-button.service';
import { FormsTogglerService } from '@features/trade/services/forms-toggler/forms-toggler.service';
import { TradeInfoManager } from '@features/trade/services/trade-info-manager/trade-info-manager.service';
import { AlternativeRoutesService } from '@features/trade/services/alternative-route-api-service/alternative-routes.service';
import { RefundService } from '@features/trade/services/refund-service/refund.service';
import { SolanaGaslessService } from '@features/trade/services/solana-gasless/solana-gasless.service';
import { SolanaGaslessStateService } from '@features/trade/services/solana-gasless/solana-gasless-state.service';
import { PrivateModalsService } from '@features/privacy/providers/shared-privacy-providers/services/private-modals/private-modals.service';

@NgModule({
  declarations: [
    PublicTokensSelectorComponent,
    PrivateTokensSelectorComponent,
    HideTokensWindowComponent
  ],
  imports: [CommonModule, AssetsSelectorModule, SharedTradeModule, SharedModule, TuiButtonModule],
  exports: [
    PublicTokensSelectorComponent,
    PrivateTokensSelectorComponent,
    SharedTradeModule,
    HideTokensWindowComponent
  ],
  providers: [
    [
      SwapsFormService,
      PreviewSwapService,
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
      SolanaGaslessStateService,
      PrivateModalsService
    ]
  ]
})
export class SharedPrivacyProvidersModule {}
