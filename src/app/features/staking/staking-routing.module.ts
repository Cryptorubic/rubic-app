import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StakingPageComponent } from './components/staking-page/staking-page.component';
import { StakingRoundComponent } from './components/staking-round/staking-round.component';
import { StakingRoundResolver } from './services/staking-round.resolver';

const routes: Routes = [
  {
    path: '',
    component: StakingPageComponent,
    children: [
      {
        path: 'round-one',
        component: StakingRoundComponent,
        resolve: {
          stakingContractAddress: StakingRoundResolver
        }
      },
      {
        path: 'round-two',
        component: StakingRoundComponent,
        resolve: {
          stakingContractAddress: StakingRoundResolver
        }
      },
      {
        path: '',
        redirectTo: 'round-two'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class StakingRoutingModule {}
