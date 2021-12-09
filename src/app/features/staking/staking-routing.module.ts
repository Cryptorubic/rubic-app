import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StakingPageComponent } from '@features/staking/staking-page.component';

const routes: Routes = [{ path: '', component: StakingPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class StakingRoutingModule {}
