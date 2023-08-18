import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingRedirectGuard } from '@shared/guards/landing-redirect-guard.service';
import { EXTERNAL_LINKS, ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
  },
  {
    path: ROUTE_PATH.LIMIT_ORDER,
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
  },
  {
    path: ROUTE_PATH.STAKING,
    loadChildren: () => import('./features/earn/staking.module').then(m => m.StakingModule)
  },
  {
    path: ROUTE_PATH.HISTORY,
    loadChildren: () => import('./features/history/history.module').then(m => m.HistoryModule)
  },
  {
    path: ROUTE_PATH.REVOKE_APPROVAL,
    loadChildren: () =>
      import('./features/approve-scanner/approve-scanner.module').then(m => m.ApproveScannerModule)
  },
  {
    path: ROUTE_PATH.CHANGENOW_RECENT_TRADES,
    loadChildren: () =>
      import('./features/changenow-recent-trades/changenow-recent-trades.module').then(
        m => m.ChangenowRecentTradesModuleModule
      )
  },
  {
    path: ROUTE_PATH.ABOUT,
    loadChildren: () =>
      import('./features/features-page-old/features-page.module').then(m => m.FeaturesPageModule),
    canLoad: [LandingRedirectGuard],
    canActivate: [LandingRedirectGuard],
    data: {
      externalUrl: EXTERNAL_LINKS.LANDING
    }
  },
  {
    path: ROUTE_PATH.FAQ,
    loadChildren: () => import('./features/faq-page-old/faq-page.module').then(m => m.FaqPageModule)
  },

  {
    path: ROUTE_PATH.SWAP_AND_EARN,
    loadChildren: () =>
      import('./features/swap-and-earn/swap-and-earn.module').then(m => m.SwapAndEarnModule)
  },
  {
    path: ROUTE_PATH.RETRODROP,
    loadChildren: () =>
      import('./features/swap-and-earn/swap-and-earn.module').then(m => m.SwapAndEarnModule)
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
