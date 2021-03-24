import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradesPageComponent } from './components/trades-page/trades-page.component';

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
    component: TradesPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradesRoutingModule {}
