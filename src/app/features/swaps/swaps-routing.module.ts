import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapFormComponent } from '@features/swaps/features/swap-form/swap-form.component';

const routes: Routes = [{ path: '', component: SwapFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapsRoutingModule {}
