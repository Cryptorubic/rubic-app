import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EarnPageComponent } from './components/earn-page/earn-page.component';
import { StakeFormComponent } from './components/stake-form/stake-form.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: EarnPageComponent
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
export class EarnRoutingModule {}
