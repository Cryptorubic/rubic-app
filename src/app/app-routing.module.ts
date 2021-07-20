import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
  },
  {
    path: 'bridge',
    redirectTo: 'cross-chain/bridge'
  },
  {
    path: 'crypto-tap',
    loadChildren: () =>
      import('./features/crypto-tap/crypto-tap.module').then(m => m.CryptoTapModule)
  },
  {
    path: 'buy-crypto',
    loadChildren: () =>
      import('./features/buy-crypto/buy-crypto.module').then(m => m.BuyCryptoModule)
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./features/features-page-old/features-page.module').then(m => m.FeaturesPageModule)
  },
  {
    path: 'team',
    loadChildren: () =>
      import('./features/team-page-old/team-page.module').then(m => m.TeamPageModule)
  },
  {
    path: 'contracts',
    redirectTo: '/trades-old/contracts'
  },
  {
    path: 'faq',
    loadChildren: () => import('./features/faq-page-old/faq-page.module').then(m => m.FaqPageModule)
  },
  {
    path: 'my-trades',
    loadChildren: () => import('./features/my-trades/my-trades.module').then(m => m.MyTradesModule)
  }
];

// @TODO: scrollPositionRestoration: 'disabled' is temporary solution for fix scroll problem
@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'disabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
