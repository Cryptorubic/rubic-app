import { NgModule } from '@angular/core';
import { StakingPageComponent } from './staking-page.component';
import { StakingRoutingModule } from '@features/staking/staking-routing.module';
import { CommonModule } from '@angular/common';
import { StakingComponent } from './components/staking/staking.component';
import { StakingContainerComponent } from './components/staking-container/staking-container.component';
import { TuiDataListWrapperModule, TuiSelectModule, TuiTabsModule } from '@taiga-ui/kit';
import { StakeComponent } from './components/stake/stake.component';
import { SharedModule } from '@shared/shared.module';
import { StakingTokensComponent } from './components/staking-tokens/staking-tokens.component';
import {
  TuiHintControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { StakingStatsComponent } from './components/staking-stats/staking-stats.component';
import { ReactiveFormsModule } from '@angular/forms';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { SwapModalComponent } from './components/swap-modal/swap-modal.component';

@NgModule({
  declarations: [
    StakingPageComponent,
    StakingComponent,
    StakingContainerComponent,
    StakeComponent,
    StakingTokensComponent,
    StakingStatsComponent,
    WithdrawComponent,
    SwapModalComponent
  ],
  imports: [
    CommonModule,
    StakingRoutingModule,
    TuiTabsModule,
    SharedModule,
    TuiHostedDropdownModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    ReactiveFormsModule,
    TuiHintControllerModule,
    TuiHintModule
  ]
})
export class StakingModule {}
