import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { SharedModule } from '@shared/shared.module';
import { HistoryHeaderComponent } from './components/hisory-header/history-header.component';
import {
  TuiBadgeModule,
  TuiDataListWrapperModule,
  TuiPaginationModule,
  TuiSelectModule,
  TuiTabsModule
} from '@taiga-ui/kit';
import { TuiLoaderModule, TuiSvgModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { HistoryTableComponent } from './components/history-table/history-table.component';
import { TuiTableModule, TuiTablePaginationModule } from '@taiga-ui/addon-table';
import { TableService } from '@features/history/services/table-service/table.service';
import { TuiLetModule } from '@taiga-ui/cdk';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [HistoryViewComponent, HistoryHeaderComponent, HistoryTableComponent],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    SharedModule,
    TuiTabsModule,
    TuiSvgModule,
    InlineSVGModule,
    TuiTableModule,
    TuiLoaderModule,
    TuiTablePaginationModule,
    TuiLetModule,
    TuiBadgeModule,
    TuiPaginationModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    ReactiveFormsModule
  ],
  providers: [TableService]
})
export class HistoryModule {}
