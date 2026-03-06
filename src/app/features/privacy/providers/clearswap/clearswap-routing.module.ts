import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClearswapViewComponent } from '@app/features/privacy/providers/clearswap/components/clearswap-view/clearswap-view.component';

const routes: Routes = [{ path: '', component: ClearswapViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClearswapRoutingModule {}
