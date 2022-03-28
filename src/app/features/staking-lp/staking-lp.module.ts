import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakingLpPageComponent } from './components/staking-lp-page/staking-lp-page.component';
import { StakingLpService } from './services/staking-lp.service';
import { StakingLpApiService } from './services/staking-lp-api.service';
import { StakingLpRoutingModule } from './staking-lp-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { StakingCardComponent } from './components/staking-card/staking-card.component';
import { LpCardComponent } from './components/lp-card/lp-card.component';

@NgModule({
  declarations: [
    StakingLpPageComponent,
    StatisticsComponent,
    StakingCardComponent,
    LpCardComponent,
    StatusBadgeComponent
  ],
  imports: [CommonModule, StakingLpRoutingModule, SharedModule],
  exports: [],
  providers: [StakingLpService, StakingLpApiService]
})
export class StakingLpModule {}
