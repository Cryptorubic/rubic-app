import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeViewContainerComponent } from '@features/trade/components/trade-view-container/trade-view-container.component';
import { PreviewSwapComponent } from '@features/trade/components/preview-swap/preview-swap.component';

const routes: Routes = [
  { path: '', component: TradeViewContainerComponent },
  { path: 'preview', component: PreviewSwapComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TradeRoutingModule {}
