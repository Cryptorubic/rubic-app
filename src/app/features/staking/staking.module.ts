import { NgModule } from '@angular/core';
import { StakingPageComponent } from './staking-page.component';
import { StakingRoutingModule } from '@features/staking/staking-routing.module';
import { CommonModule } from '@angular/common';
import { StakingComponent } from './components/staking/staking.component';

@NgModule({
  declarations: [StakingPageComponent, StakingComponent],
  imports: [CommonModule, StakingRoutingModule]
})
export class StakingModule {}
