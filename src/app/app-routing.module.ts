import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
  },
  {
    path: ROUTE_PATH.FACETS,
    loadComponent: () =>
      import('./features/facets/facets-page.component').then(m => m.FacetsPageComponent)
  },
  {
    path: ROUTE_PATH.REST,
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
