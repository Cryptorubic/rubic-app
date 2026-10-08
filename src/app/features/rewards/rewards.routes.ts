import { Routes } from '@angular/router';

export const REWARDS_ROUTES: Routes = [
  {
    path: 'my-collection',
    loadComponent: () =>
      import('./components/my-collection-view/my-collection-view.component').then(
        m => m.MyCollectionViewComponent
      )
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/rewards-view/rewards-view.component').then(m => m.RewardsViewComponent)
  }
];
