import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyCashViewComponent } from './components/privacy-cash-view/privacy-cash-view.component';

const routes: Routes = [{ path: '', component: PrivacyCashViewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyCashRoutingModule {}
