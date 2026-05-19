import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZamaViewComponent } from './components/zama-view/zama-view.component';

const routes: Routes = [{ path: '', component: ZamaViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZamaRoutingModule {}
