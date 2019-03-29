import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {IndexComponent} from './index/index.component';
import {ContractEditResolver, ContractFormComponent} from './contract-form/contract-form.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

