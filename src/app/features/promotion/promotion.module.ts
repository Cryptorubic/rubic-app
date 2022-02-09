import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromotionPageComponent } from 'src/app/features/promotion/promotion-page.component';
import { PromotionRoutingModule } from '@features/promotion/promotion-routing.module';
import { PromotionTableComponent } from './components/promotion-invited-projects/components/promotion-table/promotion-table.component';
import { SharedModule } from '@shared/shared.module';
import { TuiTableModule, TuiTablePaginationModule } from '@taiga-ui/addon-table';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiSvgModule
} from '@taiga-ui/core';
import { PromotionService } from '@features/promotion/services/promotion.service';
import { PromotionStatsComponent } from './components/promotion-stats/promotion-stats.component';
import { PromotionAccordionComponent } from './components/promotion-invited-projects/components/promotion-accordion/promotion-accordion.component';
import { PromotionInvitedProjectsComponent } from './components/promotion-invited-projects/promotion-invited-projects.component';
import { TuiAccordionModule, TuiPaginationModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    PromotionPageComponent,
    PromotionTableComponent,
    PromotionStatsComponent,
    PromotionAccordionComponent,
    PromotionInvitedProjectsComponent
  ],
  imports: [
    CommonModule,
    PromotionRoutingModule,
    SharedModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiAccordionModule,
    TuiPaginationModule,
    TuiTablePaginationModule,
    InlineSVGModule,
    TuiHostedDropdownModule,
    TuiDropdownControllerModule,
    TuiSvgModule,
    TuiDataListModule,
    TuiButtonModule
  ],
  providers: [PromotionService]
})
export class PromotionModule {}
