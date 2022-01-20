import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PromotionPageComponent } from '@features/promotion/promotion-page.component';

const routes: Routes = [{ path: 'promotion', component: PromotionPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)]
})
export class PromotionRoutingModule {}
