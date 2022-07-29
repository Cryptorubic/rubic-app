import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EarnPageComponent } from './components/earn-page/earn-page.component';
import { EarnRoutingModule } from './earn-routing.module';
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
import { StatisticsService } from '@features/earn/services/statistics.service';
import {
  TuiAccordionModule,
  TuiInputRangeModule,
  TuiInputSliderModule,
  TuiRadioLabeledModule,
  TuiSliderModule
} from '@taiga-ui/kit';
import { SwapsModule } from '@features/swaps/swaps.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DepositsComponent } from '@features/earn/components/deposits/deposits.component';
import { DepositComponent } from '@features/earn/components/deposits/components/deposit/deposit.component';
import { StakingService } from './services/staking.service';
import { StakeFormComponent } from './components/stake-form/stake-form.component';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';
import { StakingModalService } from './services/staking-modal.service';

@NgModule({
  declarations: [
    EarnPageComponent,
    StatisticsComponent,
    StakingCardComponent,
    LpCardComponent,
    DepositsComponent,
    DepositComponent,
    StakeFormComponent,
    StakeButtonComponent
  ],
  imports: [
    CommonModule,
    EarnRoutingModule,
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
  providers: [StatisticsService, StakingService, StakingModalService]
})
export class EarnModule {}
