import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradePageComponent } from '@features/trade/components/trade-page/trade-page.component';
import { PreviewSwapComponent } from '@features/trade/components/preview-swap/preview-swap.component';

const routes: Routes = [
  { path: '', component: TradePageComponent },
  { path: 'preview', component: PreviewSwapComponent, pathMatch: 'full' }
  // { path: 'fiat', component: FiatPageComp}
  // { path: 'changenow-post', component: ChangenowPostFormComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule {}
