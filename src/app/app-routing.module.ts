import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from './index/index.component';
import {ContractEditResolver, ContractFormComponent} from './contract-form/contract-form.component';
import {ContractPreviewComponent} from './contract-preview/contract-preview.component';
import {ContractsListComponent, ContractsListResolver} from './contracts-list/contracts-list.component';
import {ContractFormTwoComponent} from './contract-form-two/contract-form-two.component';
import {ContractPreviewTwoComponent} from './contract-preview-two/contract-preview-two.component';
import { TeamComponent } from './team-component/team.component';
import { RoadmapComponent } from './roadmap-component/roadmap.component';
import { FaqComponent } from './faq-component/faq.component';
import { ContactsComponent } from './contacts-component/contacts.component';
import {ContractEditV3Resolver, ContractFormAllComponent} from './contract-form-all/contract-form-all.component';
import {ContractsPreviewV3Component} from './contracts-preview-v3/contracts-preview-v3.component';
import {IndexIcoComponent} from './index-ico/index-ico.component';





export const PROJECT_PARTS = {
  TEST: {
    '^/.+$': 'devswaps.mywish.io'
  },
  PROD: {
    '^/$': 'swaps.network',
    '^/.+$': 'trades.swaps.network',
    from: 'swaps.network'
  },
  LOCAL: {
    '^/.+$': 'local.devswaps.mywish.io'
  }
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
    component: ((location.hostname !== 'trades.swaps.network') && (currMode === 'PROD')) ? IndexIcoComponent : IndexComponent,
    data: {
      noheader: location.hostname !== 'trades.swaps.network'
    }
  }, {
    path: 'create',
    component: ContractFormComponent,
    data: {
      support: true
    }
  }, {
    path: 'create-v2',
    component: ContractFormTwoComponent,
    data: {
      support: true
    }
  }, {
    path: 'create-swaps',
    component: ContractFormAllComponent,
    data: {
      support: true
    }
  }, {
    path: 'view/:id',
    component: ContractFormComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      support: true
    }
  }, {
    path: 'view-v2/:id',
    component: ContractFormTwoComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      support: true
    }
  }, {
    path: 'view-v3/:id',
    component: ContractFormAllComponent,
    resolve: {
      contract: ContractEditV3Resolver
    },
    data: {
      support: true
    }
  }, {
    path: 'contract/:id',
    component: ContractPreviewComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'contract-v2/:id',
    component: ContractPreviewTwoComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'contract-v3/:id',
    component: ContractsPreviewV3Component,
    resolve: {
      contract: ContractEditV3Resolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'public/:public_link',
    component: ContractPreviewComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'public-v2/:public_link',
    component: ContractPreviewTwoComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'public-v3/:public_link',
    component: ContractsPreviewV3Component,
    resolve: {
      contract: ContractEditV3Resolver
    },
    data: {
      supportHide: 1024,
      support: true,
      hideInstruction: true
    }
  }, {
    path: 'contracts',
    component: ContractsListComponent,
    resolve: {
      contracts: ContractsListResolver
    },
    data: {
      support: true
    }
  }, {
    path: 'dashboard/first_entry',
    redirectTo: '/'
  },
  {
    path: 'accounts/login',
    redirectTo: '/'
  },
  {
    path: 'team',
    component: TeamComponent,
  },
  {
    path: 'roadmap',
    component: RoadmapComponent,
  },
  {
    path: 'faq',
    component: FaqComponent,
  },
  {
    path: 'contacts',
    component: ContactsComponent,
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

