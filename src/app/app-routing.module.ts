import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import {
  ContractsListComponent,
  ContractsListResolver,
} from './contracts-list/contracts-list.component';

import { FaqComponent } from './faq-component/faq.component';
import { ContractsPreviewV3Component, ContractEditV3Resolver } from './contracts-preview-v3/contracts-preview-v3.component';
// import { MainPageComponent } from './main-page/main-page.component';
import { AboutageComponent } from './about/about.component';
import {TokenSaleComponent} from "./token-sale/token-sale.component";
import {Observable} from "rxjs";
import {StartFormResolver} from "./index/start-form/start-form.component";

export const PROJECT_PARTS = {
  TEST: {
    '^/.+$': 'devswaps.mywish.io',
  },
  PROD: {
    '^/$': 'swaps.network',
    '^/.+$': 'trades.swaps.network',
    from: 'swaps.network',
  },
  LOCAL: {
    '^/.+$': 'local.devswaps.mywish.io',
  },
};

let currMode = 'PROD';
// tslint:disable-next-line: forin
for (const m in PROJECT_PARTS) {
  for (const hostname in PROJECT_PARTS[m]) {
    if (location.hostname === PROJECT_PARTS[m][hostname]) {
      currMode = m;
    }
  }
}

export const MODE = currMode;

const routes: Routes = [
  // landing
  // {
  //   path: '',
  //   component: MainPageComponent,
  //   data: {
  //     noheader: true,
  //   },
  // },
  {
    path: '',
    component: IndexComponent,
    resolve: {
      checkedTokens: StartFormResolver
    }
  },
  {
    path: 'about',
    component: AboutageComponent,
  },
  {
    path: 'create-v3',
    redirectTo: '/trades/create-v3',
  },
  {
    path: 'create',
    redirectTo: '/trades/create',
  },
  {
    path: 'view/:id',
    redirectTo: '/trades/view/:id',
  },
  {
    path: 'view-v3/:id',
    redirectTo: '/trades/view-v3/:id',
  },
  {
    path: 'contract/:id',
    redirectTo: '/trades/contract/:id',
  },
  {
    path: 'contract-v3/:id',
    redirectTo: '/trades/contract-v3/:id',
  },
  {
    path: 'public/:public_link',
    redirectTo: '/trades/public/:public_link',
  },
  {
    path: 'public-v3/:public_link',
    redirectTo: '/trades/public-v3/:public_link',
  },
  {
    path: 'contracts',
    redirectTo: '/trades/contracts',
  },
  {
    path: 'trades',
    children: [
      {
        path: '',
        redirectTo: '/',
        pathMatch: 'full',
      },
      {
        path: 'public-v3/:public_link',
        component: ContractsPreviewV3Component,
        resolve: {
          contract: ContractEditV3Resolver,
        },
        data: {
          createButton: true,
          hideInstruction: true,
        },
      },
      {
        path: 'contracts',
        component: ContractsListComponent,
        resolve: {
          contracts: ContractsListResolver,
        },
      },
    ],
  },
  {
    path: 'dashboard/first_entry',
    redirectTo: '/trades',
  },
  {
    path: 'accounts/login',
    redirectTo: '/trades',
  },
  {
    path: 'reset/:uid/:token',
    component: IndexComponent,
  },
  {
    path: 'faq',
    component: FaqComponent,
  },
  {
    path: 'token-sale',
    component: TokenSaleComponent,
  },
  {
    path: ':token',
    component: IndexComponent,
    resolve: {
      checkedTokens: StartFormResolver
    }
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
