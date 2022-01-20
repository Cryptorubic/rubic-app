import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionPageComponent } from 'src/app/features/promotion/promotion-page.component';
import { PromotionRoutingModule } from '@features/promotion/promotion-routing.module';

@NgModule({
  declarations: [PromotionPageComponent],
  imports: [CommonModule, PromotionRoutingModule]
})
export class PromotionModule {}
