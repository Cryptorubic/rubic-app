import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CrossChainSwapsComponent } from './main-page/cross-chain-swaps.component';

const routes: Routes = [
  {
    path: '',
    component: CrossChainSwapsComponent,
    children: [
      {
        path: 'get-bnb',
        loadChildren: () =>
          import('./get-bnb-page/get-bnb-page.module').then(m => m.GetBnbPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrossChainSwapsPageRoutingModule {}
