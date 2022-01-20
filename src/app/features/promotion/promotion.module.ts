import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionPageComponent } from 'src/app/features/promotion/promotion-page.component';
import { PromotionRoutingModule } from '@features/promotion/promotion-routing.module';
import { PromotionTableComponent } from './components/promotion-table/promotion-table.component';
import { PromotionLinkComponent } from './components/promotion-link/promotion-link.component';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [PromotionPageComponent, PromotionTableComponent, PromotionLinkComponent],
  imports: [CommonModule, PromotionRoutingModule, SharedModule]
})
export class PromotionModule {}
