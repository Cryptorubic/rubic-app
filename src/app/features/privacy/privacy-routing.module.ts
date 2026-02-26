import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyMainPageComponent } from '@features/privacy/components/privacy-main-page/privacy-main-page.component';
import { PRIVACY_ROUTE_PATH } from '@features/privacy/routes';

const routes: Routes = [
  {
    path: PRIVACY_ROUTE_PATH.RAILGUN,
    loadChildren: () => import('./providers/railgun/railgun.module').then(m => m.RailgunModule)
  },
  {
    path: PRIVACY_ROUTE_PATH.NONE,
    component: PrivacyMainPageComponent
  },
  {
    path: PRIVACY_ROUTE_PATH.REST,
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyRoutingModule {}
