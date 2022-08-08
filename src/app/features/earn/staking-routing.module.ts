import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StakeFormComponent } from './components/stake-form/stake-form.component';
import { StakingPageComponent } from './components/staking-page/staking-page.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: StakingPageComponent
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
export class StakingRoutingModule {}
