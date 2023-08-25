import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradePageComponent } from '@features/trade/components/trade-page/trade-page.component';

const routes: Routes = [
  { path: '', component: TradePageComponent }
  // { path: 'fiat', component: FiatPageComp}
  // { path: 'changenow-post', component: ChangenowPostFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule {}
