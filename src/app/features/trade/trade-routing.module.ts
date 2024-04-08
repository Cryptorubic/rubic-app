import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GasFormActivationGuard } from '@app/shared/guards/gas-form-activation.guard';
import { TradeViewContainerComponent } from '@features/trade/components/trade-view-container/trade-view-container.component';

const routes: Routes = [
  {
    path: 'get-gas',
    canActivate: [GasFormActivationGuard],
    component: TradeViewContainerComponent
  },
  { path: 'preview', redirectTo: '' },
  { path: '', component: TradeViewContainerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule {}
