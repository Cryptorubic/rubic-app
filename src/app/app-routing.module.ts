import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTE_PATH } from '@shared/constants/common/links';
import { privacyAuthGuard } from '@features/privacy/guards/privacy-auth.guard';
import { privacyDisclaimerGuard } from '@features/privacy/guards/privacy-disclaimer.guard';

const routes: Routes = [
  {
    path: ROUTE_PATH.HISTORY,
    loadChildren: () => import('./features/history/history.module').then(m => m.HistoryModule)
  },
  {
    path: ROUTE_PATH.TESTNET_PROMO,
    loadChildren: () =>
      import('./features/testnet-promo/testnet-promo.module').then(m => m.TestnetPromoModule)
  },
  {
    path: ROUTE_PATH.PRIVACY,
    canActivateChild: [privacyAuthGuard, privacyDisclaimerGuard],
    loadChildren: () => import('./features/privacy/privacy.module').then(m => m.PrivacyModule)
  },
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/trade/trade.module').then(m => m.TradeModule)
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
