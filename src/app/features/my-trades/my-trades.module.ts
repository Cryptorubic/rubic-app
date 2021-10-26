import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTradesRoutingModule } from 'src/app/features/my-trades/my-trades-routing.module';
import { TuiTableModule, TuiTablePaginationModule } from '@taiga-ui/addon-table';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiSvgModule
} from '@taiga-ui/core';
import { TuiLetModule, TuiMapperPipeModule } from '@taiga-ui/cdk';
import { InlineSVGModule } from 'ng-inline-svg';
import { TuiAccordionModule, TuiPaginationModule } from '@taiga-ui/kit';
import { MyTradesPageComponent } from 'src/app/features/my-trades/my-trades-page.component';
import { GasRefundService } from 'src/app/features/my-trades/services/gas-refund.service';
import { MyTradesComponent } from './components/my-trades/my-trades.component';
import { SharedModule } from '../../shared/shared.module';
import { TableComponent } from './components/my-trades/components/table/table.component';
import { AccordionComponent } from './components/my-trades/components/accordion/accordion.component';
import { GasRefundComponent } from './components/gas-refund/gas-refund.component';
import { GasRefundCardComponent } from './components/gas-refund/components/gas-refund-card/gas-refund-card.component';

@NgModule({
  declarations: [
    MyTradesComponent,
    TableComponent,
    AccordionComponent,
    GasRefundComponent,
    MyTradesPageComponent,
    GasRefundCardComponent
  ],
  imports: [
    CommonModule,
    MyTradesRoutingModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiLetModule,
    TuiTablePaginationModule,
    InlineSVGModule,
    SharedModule,
    TuiAccordionModule,
    TuiPaginationModule,
    TuiHostedDropdownModule,
    TuiDropdownControllerModule,
    TuiButtonModule,
    TuiDataListModule,
    TuiSvgModule,
    TuiScrollbarModule,
    TuiHintModule,
    TuiMapperPipeModule
  ],
  providers: [GasRefundService]
})
export class MyTradesModule {}
