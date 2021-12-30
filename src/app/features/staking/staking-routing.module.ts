import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StakingPageComponent } from './components/staking-page/staking-page.component';

const routes: Routes = [{ path: '', component: StakingPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class StakingRoutingModule {}
