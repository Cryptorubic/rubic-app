import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MyTradesV2Component } from './components/my-trades-v2.component';

const routes: Routes = [{ path: '', component: MyTradesV2Component }];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyTradesv2RoutingModule {}
