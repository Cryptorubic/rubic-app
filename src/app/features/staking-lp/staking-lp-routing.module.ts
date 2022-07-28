import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StakingLpPageComponent } from './components/staking-lp-page/staking-lp-page.component';
import { StakeFormComponent } from './components/stake-form/stake-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: StakingLpPageComponent
      },
      {
        path: 'new-position',
        component: StakeFormComponent
      }
    ]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StakingLpRoutingModule {}
