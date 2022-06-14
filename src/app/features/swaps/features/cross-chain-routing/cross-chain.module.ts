import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { CrossChainRoutingBottomFormComponent } from '@features/swaps/features/cross-chain-routing/components/cross-chain-routing-bottom-form/cross-chain-routing-bottom-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiHintModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TargetNetworkAddressComponent } from 'src/app/features/swaps/features/cross-chain-routing/components/target-network-address/target-network-address.component';
import { SmartRoutingComponent } from 'src/app/features/swaps/features/cross-chain-routing/components/smart-routing/smart-routing.component';
import { CelerService } from './services/cross-chain-routing-service/celer/celer.service';
import { CelerApiService } from './services/cross-chain-routing-service/celer/celer-api.service';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { CrossChainRoutingService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/cross-chain-routing.service';
import { ContractsDataService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contracts-data/contracts-data.service';
import { ContractExecutorFacadeService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/contract-executor-facade.service';
import { EthLikeContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/eth-like-contract-executor.service';
import { NearContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/near-contract-executor.service';
import { SolanaContractExecutorService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/contract-executor/solana-contract-executor.service';
import { TargetNetworkAddressService } from '@features/swaps/features/cross-chain-routing/services/target-network-address-service/target-network-address.service';
import { SwapsCoreModule } from '@features/swaps/core/swaps-core.module';
import { SymbiosisService } from '@features/swaps/features/cross-chain-routing/services/cross-chain-routing-service/symbiosis/symbiosis.service';

@NgModule({
  declarations: [
    CrossChainRoutingBottomFormComponent,
    TargetNetworkAddressComponent,
    SmartRoutingComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    SwapsSharedModule,
    SwapsCoreModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiInputModule,
    InlineSVGModule,
    TuiHintModule
  ],
  exports: [CrossChainRoutingBottomFormComponent],
  providers: [
    CrossChainRoutingService,
    ContractsDataService,
    ContractExecutorFacadeService,
    EthLikeContractExecutorService,
    NearContractExecutorService,
    SolanaContractExecutorService,
    CelerService,
    CelerApiService,
    TargetNetworkAddressService,
    SymbiosisService
  ]
})
export class CrossChainModule {}
