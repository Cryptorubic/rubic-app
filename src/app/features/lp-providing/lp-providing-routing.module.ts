import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LpProvidingPageComponent } from './components/lp-providing-page/lp-providing-page.component';

const routes: Routes = [
  {
    path: '',
    component: LpProvidingPageComponent
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LpProvidingRoutingModule {}
