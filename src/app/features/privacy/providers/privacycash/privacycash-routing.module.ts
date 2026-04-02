import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacycashMainPageComponent } from './components/privacycash-main-page/privacycash-main-page.component';

const routes: Routes = [{ path: '', component: PrivacycashMainPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyCashRoutingModule {}
