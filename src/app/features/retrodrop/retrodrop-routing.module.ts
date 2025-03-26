import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RetrodropFinishedComponent } from './components/retrodrop-finished/retrodrop-finished.component';

const routes: Routes = [
  {
    path: '',
    component: RetrodropFinishedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class RetrodropRoutingModule {}
