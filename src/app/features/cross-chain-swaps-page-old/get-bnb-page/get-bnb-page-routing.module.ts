import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GetBnbComponent } from './components/get-bnb/get-bnb.component';

const routes: Routes = [{ path: '', component: GetBnbComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GetBnbPageRoutingModule {}
