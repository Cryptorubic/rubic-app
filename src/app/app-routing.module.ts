import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from './index/index.component';
import {ContractEditResolver, ContractFormComponent} from './contract-form/contract-form.component';
import {ContractPreviewComponent} from './contract-preview/contract-preview.component';
import {ContractsListComponent, ContractsListResolver} from './contracts-list/contracts-list.component';

const routes: Routes = [
  {
    path: '',
    component: IndexComponent
  }, {
    path: 'create',
    component: ContractFormComponent
  }, {
    path: 'view/:id',
    component: ContractFormComponent,
    resolve: {
      contract: ContractEditResolver
    }
  }, {
    path: 'contract/:id',
    component: ContractPreviewComponent,
    resolve: {
      contract: ContractEditResolver
    }
  }, {
    path: 'public/:public_link',
    component: ContractPreviewComponent,
    resolve: {
      contract: ContractEditResolver
    }
  }, {
    path: 'contracts',
    component: ContractsListComponent,
    resolve: {
      contracts: ContractsListResolver
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

