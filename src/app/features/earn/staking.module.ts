import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingRoutingModule } from './staking-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { StatisticsService } from './services/statistics.service';
import {
  TuiAccordionModule,
  TuiCarouselModule,
  TuiPaginationModule,
  TuiSliderModule
} from '@taiga-ui/kit';
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
import { DesktopDepositsComponent } from './components/desktop-deposits/desktop-deposits.component';
import { MobileDepositsComponent } from './components/mobile-deposits/mobile-deposits.component';
import { LockedRbcComponent } from './components/statistics/components/locked-rbc/locked-rbc.component';
import { LockedRbcInDollarsComponent } from './components/statistics/components/locked-rbc-in-dollars/locked-rbc-in-dollars.component';
import { LockedRbcInPercentComponent } from './components/statistics/components/locked-rbc-in-percent/locked-rbc-in-percent.component';
import { AverageLockTimeComponent } from './components/statistics/components/average-lock-time/average-lock-time.component';
import { RewardPerWeekComponent } from './components/statistics/components/reward-per-week/reward-per-week.component';
import { AverageAprComponent } from './components/statistics/components/average-apr/average-apr.component';

@NgModule({
  declarations: [
    StakingPageComponent,
    StatisticsComponent,
    DepositsComponent,
    StakeFormComponent,
    StakeButtonComponent,
    NewPositionModalComponent,
    WithdrawModalComponent,
    ClaimModalComponent,
    DesktopDepositsComponent,
    MobileDepositsComponent,
    LockedRbcComponent,
    LockedRbcInDollarsComponent,
    LockedRbcInPercentComponent,
    AverageLockTimeComponent,
    RewardPerWeekComponent,
    AverageAprComponent
  ],
  imports: [
    CommonModule,
    StakingRoutingModule,
    SharedModule,
    InlineSVGModule,
    TuiLoaderModule,
    TuiAccordionModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule,
    TuiSliderModule,
    TuiHintModule,
    TuiHintModule,
    TuiButtonModule,
    TuiCarouselModule,
    TuiPaginationModule
  ],
  providers: [StatisticsService, StakingService, StakingModalService, StakingNotificationService]
})
export class StakingModule {}
