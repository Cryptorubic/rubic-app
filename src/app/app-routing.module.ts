import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import {
  ContractEditResolver,
  ContractFormComponent,
} from './contract-form/contract-form.component';
import { ContractPreviewComponent } from './contract-preview/contract-preview.component';
import {
  ContractsListComponent,
  ContractsListResolver,
} from './contracts-list/contracts-list.component';

import { FaqComponent } from './faq-component/faq.component';
import {
  ContractEditV3Resolver,
  ContractFormAllComponent,
} from './contract-form-all/contract-form-all.component';
import { ContractsPreviewV3Component } from './contracts-preview-v3/contracts-preview-v3.component';
import { MainPageComponent } from './main-page/main-page.component';

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
for (const m in PROJECT_PARTS) {
  for (const hostname in PROJECT_PARTS[m]) {
    if (location.hostname === PROJECT_PARTS[m][hostname]) {
      currMode = m;
    }
  }
}

export const MODE = currMode;

const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
  },
  {
    path: 'app',
    component: IndexComponent,
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
        path: 'create',
        component: ContractFormComponent,
        data: {
          // support: true
        },
      },
      {
        path: 'create-v3',
        component: ContractFormAllComponent,
        data: {
          // support: true
        },
      },
      {
        path: 'view/:id',
        component: ContractFormComponent,
        resolve: {
          contract: ContractEditResolver,
        },
        data: {
          createButton: true,
        },
      },
      {
        path: 'view-v3/:id',
        component: ContractFormAllComponent,
        resolve: {
          contract: ContractEditV3Resolver,
        },
        data: {
          createButton: true,
        },
      },
      {
        path: 'contract/:id',
        component: ContractPreviewComponent,
        resolve: {
          contract: ContractEditResolver,
        },
        data: {
          supportHide: 1024,
          createButton: true,
          hideInstruction: true,
        },
      },
      {
        path: 'contract-v3/:id',
        component: ContractsPreviewV3Component,
        resolve: {
          contract: ContractEditV3Resolver,
        },
        data: {
          supportHide: 1024,
          createButton: true,
          hideInstruction: true,
        },
      },
      {
        path: 'public/:public_link',
        component: ContractPreviewComponent,
        resolve: {
          contract: ContractEditResolver,
        },
        data: {
          createButton: true,
          hideInstruction: true,
        },
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
  /*{
    path: 'team',
    component: TeamComponent,
  },
  {
    path: 'roadmap',
    component: RoadmapComponent,
  },*/
  {
    path: 'faq',
    component: FaqComponent,
  } /*,
  {
    path: 'contacts',
    component: ContactsComponent,
  }*/,
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
