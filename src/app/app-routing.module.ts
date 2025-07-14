import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/trade/trade.module').then(m => m.TradeModule)
  },
  {
    path: ROUTE_PATH.STAKING,
    loadChildren: () => import('./features/earn/staking.module').then(m => m.StakingModule)
  },
  {
    path: ROUTE_PATH.REVOKE_APPROVAL,
    loadChildren: () =>
      import('./features/approve-scanner/approve-scanner.module').then(m => m.ApproveScannerModule)
  },
  {
    path: ROUTE_PATH.AIRDROP,
    loadChildren: () => import('./features/airdrop/airdrop.module').then(m => m.AirdropModule)
  },
  {
    path: ROUTE_PATH.RETRODROP,
    loadChildren: () => import('./features/retrodrop/retrodrop.module').then(m => m.RetrodropModule)
  },
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
    path: ROUTE_PATH.BERACHELLA,
    loadChildren: () =>
      import('./features/berachella/berachella.module').then(m => m.BerachellaModule)
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
