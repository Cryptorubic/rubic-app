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
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiManualHintModule
} from '@taiga-ui/core';
import { StakingRoundsComponent } from './components/staking-rounds/staking-rounds.component';
import { LpRoundsComponent } from './components/lp-rounds/lp-rounds.component';

@NgModule({
  declarations: [
    StakingLpPageComponent,
    StatisticsComponent,
    StakingCardComponent,
    LpCardComponent,
    StakingRoundsComponent,
    LpRoundsComponent
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
    TuiHintModule
  ],
  providers: [StakingLpService]
})
export class StakingLpModule {}
