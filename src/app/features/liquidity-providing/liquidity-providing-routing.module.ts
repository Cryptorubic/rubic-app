import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LpPageComponent } from './components/lp-page/lp-page.component';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { LpRoundTimeGuard } from './guards/lp-round-time.guard';

const routes: Routes = [
  {
    path: '',
    component: LpPageComponent,
    canActivate: [LpRoundTimeGuard]
  },
  {
    path: 'deposit',
    component: DepositFormComponent,
    canActivate: [LpRoundTimeGuard]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiquidityProvidingRoutingModule {}
