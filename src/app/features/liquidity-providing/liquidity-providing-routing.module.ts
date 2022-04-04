import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LpPageComponent } from './components/lp-page/lp-page.component';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { UntilTimeGuard } from '@app/shared/guards/until-time.guard';

const routes: Routes = [
  {
    path: '',
    component: LpPageComponent,
    canActivate: [UntilTimeGuard]
  },
  {
    path: 'deposit',
    component: DepositFormComponent,
    canActivate: [UntilTimeGuard]
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiquidityProvidingRoutingModule {}
