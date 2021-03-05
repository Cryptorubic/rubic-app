import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractsListComponent } from 'src/app/features/trades/components/contracts-list/contracts-list.component';
import { ContractsListResolver } from 'src/app/features/trades/components/contracts-list/contracts-list.reslover';
import { ContractsPreviewV3Component } from './components/contracts-preview-v3/contracts-preview-v3.component';
import { ContractEditV3Resolver } from './components/contracts-preview-v3/contracts-preview-v3.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'public-v3/:public_link',
    component: ContractsPreviewV3Component,
    resolve: {
      contract: ContractEditV3Resolver
    },
    data: {
      createButton: true,
      hideInstruction: true
    }
  },
  {
    path: 'contracts',
    component: ContractsListComponent,
    resolve: {
      contracts: ContractsListResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradesRoutingModule {}
