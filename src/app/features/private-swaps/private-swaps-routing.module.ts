import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivateSwapsViewComponent } from './components/private-swaps-view/private-swaps-view.component';

const routes: Routes = [
  {
    path: '',
    component: PrivateSwapsViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class PrivateSwapsRoutingModule {}
