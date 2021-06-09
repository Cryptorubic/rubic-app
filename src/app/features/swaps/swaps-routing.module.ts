import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InstantTradeModule } from 'src/app/features/instant-trade/instant-trade.module';
import { SwapsFormComponent } from 'src/app/features/swaps/components/swaps-form/swaps-form.component';

const routes: Routes = [{ path: '', component: SwapsFormComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes), InstantTradeModule],
  exports: [RouterModule]
})
export class SwapsRoutingModule {}
