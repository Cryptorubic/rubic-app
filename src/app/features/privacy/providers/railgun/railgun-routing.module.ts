import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RailgunViewComponent } from './components/railgun-view/railgun-view.component';

const routes: Routes = [{ path: '', component: RailgunViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RailgunRoutingModule {}
