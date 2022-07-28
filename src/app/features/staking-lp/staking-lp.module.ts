import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingLpPageComponent } from './components/staking-lp-page/staking-lp-page.component';
import { StakingLpService } from './services/staking-lp.service';
import { StakingLpRoutingModule } from './staking-lp-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StakingCardComponent } from './components/staking-card/staking-card.component';
import { LpCardComponent } from './components/lp-card/lp-card.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiDropdownControllerModule,
  TuiDropdownModule,
  TuiHintControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiManualHintModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { StakingRoundsComponent } from './components/staking-rounds/staking-rounds.component';
import { LpRoundsComponent } from './components/lp-rounds/lp-rounds.component';
import { StatisticsService } from '@features/staking-lp/services/statistics.service';
import {
  TuiAccordionModule,
  TuiInputRangeModule,
  TuiInputSliderModule,
  TuiRadioLabeledModule,
  TuiSliderModule
} from '@taiga-ui/kit';
import { SwapsModule } from '@features/swaps/swaps.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DepositsComponent } from '@features/staking-lp/components/deposits/deposits.component';
import { DepositComponent } from '@features/staking-lp/components/deposits/components/deposit/deposit.component';
import { StakingService } from './services/staking.service';
import { StakeFormComponent } from './components/stake-form/stake-form.component';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';

@NgModule({
  declarations: [
    StakingLpPageComponent,
    StatisticsComponent,
    StakingCardComponent,
    LpCardComponent,
    StakingRoundsComponent,
    LpRoundsComponent,
    DepositsComponent,
    DepositComponent,
    StakeFormComponent,
    StakeButtonComponent
  ],
  imports: [
    CommonModule,
    StakingLpRoutingModule,
    SharedModule,
    InlineSVGModule,
    TuiManualHintModule,
    TuiHostedDropdownModule,
    TuiDropdownControllerModule,
    TuiDropdownModule,
    TuiLoaderModule,
    TuiHintModule,
    TuiAccordionModule,
    SwapsModule,
    ReactiveFormsModule,
    TuiRadioLabeledModule,
    TuiInputRangeModule,
    TuiTextfieldControllerModule,
    TuiInputSliderModule,
    TuiHintControllerModule,
    TuiSliderModule
  ],
  providers: [StakingLpService, StatisticsService, StakingService]
})
export class StakingLpModule {}
