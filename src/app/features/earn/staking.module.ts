import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingRoutingModule } from './staking-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StakingCardComponent } from './components/staking-card/staking-card.component';
import { LpCardComponent } from './components/lp-card/lp-card.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiLoaderModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { StatisticsService } from './services/statistics.service';
import { TuiAccordionModule, TuiSliderModule } from '@taiga-ui/kit';
import { SwapsModule } from '@features/swaps/swaps.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DepositsComponent } from './components/deposits/deposits.component';
import { StakingService } from './services/staking.service';
import { StakeFormComponent } from './components/stake-form/stake-form.component';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';
import { StakingModalService } from './services/staking-modal.service';
import { NewPositionModalComponent } from './components/new-position-modal/new-position-modal.component';
import { WithdrawModalComponent } from './components/withdraw-modal/withdraw-modal.component';
import { ClaimModalComponent } from './components/claim-modal/claim-modal.component';
import { StakingNotificationService } from './services/staking-notification.service';
import { StakingPageComponent } from './components/staking-page/staking-page.component';

@NgModule({
  declarations: [
    StakingPageComponent,
    StatisticsComponent,
    StakingCardComponent,
    LpCardComponent,
    DepositsComponent,
    StakeFormComponent,
    StakeButtonComponent,
    NewPositionModalComponent,
    WithdrawModalComponent,
    ClaimModalComponent
  ],
  imports: [
    CommonModule,
    StakingRoutingModule,
    SharedModule,
    InlineSVGModule,
    TuiLoaderModule,
    TuiAccordionModule,
    SwapsModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiSliderModule
  ],
  providers: [StatisticsService, StakingService, StakingModalService, StakingNotificationService]
})
export class StakingModule {}
