import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HinkalViewComponent } from './components/hinkal-view/hinkal-view.component';

const routes: Routes = [{ path: '', component: HinkalViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HinkalRoutingModule {}
