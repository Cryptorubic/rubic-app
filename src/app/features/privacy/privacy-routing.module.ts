import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyMainPageComponent } from '@features/privacy/components/privacy-main-page/privacy-main-page.component';

const routes: Routes = [{ path: '', component: PrivacyMainPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyRoutingModule {}
