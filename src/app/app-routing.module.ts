import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: ROUTE_PATH.HISTORY,
    loadChildren: () => import('./features/history/history.module').then(m => m.HistoryModule)
  },
  {
    path: ROUTE_PATH.PRIVACY,
    redirectTo: () => {
      window.location.assign(
        `${window.location.origin}?from=ETH&fromChain=ETH&to=USDT&toChain=ETH&amount=1&privateOnly=true`
      );
      return '';
    }
  },
  {
    path: ROUTE_PATH.REWARDS,
    loadChildren: () => import('./features/rewards/rewards.routes').then(m => m.REWARDS_ROUTES)
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
