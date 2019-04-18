import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from './index/index.component';
import {ContractEditResolver, ContractFormComponent} from './contract-form/contract-form.component';
import {ContractPreviewComponent} from './contract-preview/contract-preview.component';
import {ContractsListComponent, ContractsListResolver} from './contracts-list/contracts-list.component';
import {ContractFormTwoComponent} from './contract-form-two/contract-form-two.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
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
    path: 'view/:id',
    component: ContractFormComponent,
    resolve: {
      contract: ContractEditResolver
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
      support: true
    }
  }, {
    path: 'public/:public_link',
    component: ContractPreviewComponent,
    resolve: {
      contract: ContractEditResolver
    },
    data: {
      supportHide: 1024,
      support: true
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
  }, {
    path: 'accounts/login',
    redirectTo: '/'
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

