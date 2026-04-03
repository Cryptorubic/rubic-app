import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Zkp2pFormComponent } from './components/zkp2p-form/zkp2p-form.component';

const routes: Routes = [{ path: '', component: Zkp2pFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Zkp2pRoutingModule {}
