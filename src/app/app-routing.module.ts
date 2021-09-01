import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
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
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
