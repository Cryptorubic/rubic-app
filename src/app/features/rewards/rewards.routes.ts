import { Routes } from '@angular/router';

export const REWARDS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/rewards-view/rewards-view.component').then(m => m.RewardsViewComponent)
  }
];
