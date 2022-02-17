import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LpLandingComponent } from './components/lp-landing/lp-landing.component';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';

const routes: Routes = [
  {
    path: '',
    component: LpLandingComponent
  },
  {
    path: 'deposit',
    component: DepositFormComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LpProvidingRoutingModule {}
