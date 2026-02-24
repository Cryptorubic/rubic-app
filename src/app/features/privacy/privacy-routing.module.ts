import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyPageViewComponent } from './components/privacy-page-view/privacy-page-view.component';
import { PRIVATE_MODE_URLS } from './models/routes';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPageViewComponent
  },
  {
    path: PRIVATE_MODE_URLS.HINKAL,
    loadChildren: () => import('./providers/hinkal/hinkal.module').then(m => m.HinkalModule)
  },
  {
    path: PRIVATE_MODE_URLS.PRIVACY_CASH,
    loadChildren: () =>
      import('./providers/privacy-cash/privacy-cash.module').then(m => m.PrivacyCashModule)
  },
  {
    path: PRIVATE_MODE_URLS.RAILGUN,
    loadChildren: () => import('./providers/railgun/railgun.module').then(m => m.RailgunModule)
  },
  {
    path: PRIVATE_MODE_URLS.ZAMA,
    loadChildren: () => import('./providers/zama/zama.module').then(m => m.ZamaModule)
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrivacyRoutingModule {}
