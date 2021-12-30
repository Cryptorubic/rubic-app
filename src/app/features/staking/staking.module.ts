import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiDataListWrapperModule,
  TuiProgressModule,
  TuiSelectModule,
  TuiTabsModule
} from '@taiga-ui/kit';
import {
  TuiHintControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from '@shared/shared.module';
import { StakingRoutingModule } from './staking-routing.module';
import { StakeComponent } from './components/stake/stake.component';
import { StakingContainerComponent } from './components/staking-container/staking-container.component';
import { StakingTokensComponent } from './components/staking-tokens/staking-tokens.component';
import { WithdrawComponent } from './components/withdraw/withdraw.component';
import { SwapModalComponent } from './components/swap-modal/swap-modal.component';
import { StakingStatisticsComponent } from './components/staking-statistics/staking-statistics.component';
import { StakingInfoComponent } from './components/staking-info/staking-info.component';
import { StakeButtonContainerComponent } from './components/stake-button-container/stake-button-container.component';
import { WithdrawButtonContainerComponent } from './components/withdraw-button-container/withdraw-button-container.component';
import { StakingPageComponent } from './components/staking-page/staking-page.component';
import { StakingService } from './services/staking.service';
import { StakingApiService } from './services/staking-api.service';

@NgModule({
  declarations: [
    StakingContainerComponent,
    StakeComponent,
    StakingTokensComponent,
    WithdrawComponent,
    SwapModalComponent,
    StakingStatisticsComponent,
    StakingInfoComponent,
    StakeButtonContainerComponent,
    StakingPageComponent,
    WithdrawButtonContainerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StakingRoutingModule,
    SharedModule,
    InlineSVGModule,
    TuiTabsModule,
    TuiHostedDropdownModule,
    TuiSelectModule,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    TuiHintControllerModule,
    TuiHintModule,
    TuiProgressModule,
    TuiLoaderModule
  ],
  providers: [StakingService, StakingApiService]
})
export class StakingModule {}
