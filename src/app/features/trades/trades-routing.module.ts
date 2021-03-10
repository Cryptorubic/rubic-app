import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {
    path: 'public-v3/:public_link',
    component: null,
    resolve: {
      contract: null
    },
    data: {
      createButton: true,
      hideInstruction: true
    }
  },
  {
    path: 'contracts',
    component: null,
    resolve: {
      contracts: null
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradesRoutingModule {}
