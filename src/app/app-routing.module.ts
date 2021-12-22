import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingRedirectGuard } from '@shared/guards/landing-redirect-guard.service';
import { EXTERNAL_LINKS, ROUTE_PATH } from '@shared/constants/common/links';
import { UntilTimeGuard } from '@shared/guards/until-time.guard';

const routes: Routes = [
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/swaps/swaps.module').then(m => m.SwapsModule)
  },
  {
    path: ROUTE_PATH.BYT_CRYPTO,
    loadChildren: () =>
      import('./features/buy-crypto/buy-crypto.module').then(m => m.BuyCryptoModule)
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
    path: ROUTE_PATH.TEAM,
    loadChildren: () =>
      import('./features/team-page-old/team-page.module').then(m => m.TeamPageModule)
  },
  {
    path: ROUTE_PATH.CONTRACTS,
    redirectTo: '/trades-old/contracts'
  },
  {
    path: ROUTE_PATH.FAQ,
    loadChildren: () => import('./features/faq-page-old/faq-page.module').then(m => m.FaqPageModule)
  },
  {
    path: ROUTE_PATH.TRADES,
    loadChildren: () => import('./features/my-trades/my-trades.module').then(m => m.MyTradesModule)
  },
  {
    path: ROUTE_PATH.STAKING,
    loadChildren: () => import('./features/staking/staking.module').then(m => m.StakingModule),
    canActivate: [UntilTimeGuard]
  },
  {
    path: ROUTE_PATH.REST,
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
