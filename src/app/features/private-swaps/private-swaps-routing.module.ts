import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZamaPrivateSwapComponent } from './components/zama-private-swap/zama-private-swap.component';

const routes: Routes = [
  {
    path: '',
    component: ZamaPrivateSwapComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class PrivateSwapsRoutingModule {}
