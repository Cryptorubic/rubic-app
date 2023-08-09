import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FaucetsPageComponent } from '@features/faucets/components/faucets-page/faucets-page.component';

const routes: Routes = [{ path: '', component: FaucetsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaucetsRoutingModule {}
