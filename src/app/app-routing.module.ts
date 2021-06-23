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
    path: 'public-v3/:unique_link',
    redirectTo: '/trade/:unique_link'
  },
  {
    path: 'trades-old/public-v3/:unique_link',
    redirectTo: '/trade/:unique_link'
  },
  {
    path: 'trade/:unique_link',
    loadChildren: () =>
      import('./features/order-book-trade-page-old/order-book-trade-page.module').then(
        m => m.OrderBookTradePageModule
      )
  },
  {
    path: 'contracts',
    redirectTo: '/trades-old/contracts'
  },
  {
    path: 'trades-old',
    loadChildren: () => import('./features/trades-old/trades.module').then(m => m.TradesModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./features/faq-page-old/faq-page.module').then(m => m.FaqPageModule)
  },
  {
    path: 'token-sale',
    loadChildren: () =>
      import('./features/token-sale-page-old/token-sale-page/token-sale-page.module').then(
        m => m.TokenSalePageModule
      )
  },
  {
    path: 'my-trades',
    loadChildren: () => import('./features/my-trades/my-trades.module').then(m => m.MyTradesModule)
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
