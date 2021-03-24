import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SwapsPageComponent } from './components/swaps-page-component/swaps-page.component';

const routes: Routes = [{ path: '', component: SwapsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapsPageRoutingModule {}
