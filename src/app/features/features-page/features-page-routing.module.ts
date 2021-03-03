import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutageComponent } from './components/about/about.component';

const routes: Routes = [{ path: '', component: AboutageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeaturePageRoutingModule {}
