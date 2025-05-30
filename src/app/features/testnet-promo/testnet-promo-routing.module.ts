import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromoPageComponent } from '@features/testnet-promo/components/promo-page/promo-page.component';

const routes: Routes = [
  {
    path: '',
    component: PromoPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class TestnetPromoRoutingModule {}
