import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BerachellaComponent } from '@features/berachella/components/berachella-page/berachella.component';

const routes: Routes = [
  {
    path: '',
    component: BerachellaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class BerachellaRoutingModule {}
