import { TuiSelect } from '@taiga-ui/kit';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { SharedModule } from '@shared/shared.module';
import { HistoryHeaderComponent } from './components/hisory-header/history-header.component';
import { TuiPagination, TuiDataListWrapper, TuiBadge, TuiTabs } from '@taiga-ui/kit';
import { TuiLoader, TuiIcon, TuiButton, TuiHint } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { HistoryTableComponent } from './components/history-table/history-table.component';
import { TuiTablePagination, TuiTable } from '@taiga-ui/addon-table';
import { ReactiveFormsModule } from '@angular/forms';
import { CrossChainDesktopTableComponent } from '@features/history/components/cross-chain-desktop-table/cross-chain-desktop-table.component';
import { OnChainDesktopTableComponent } from '@features/history/components/on-chain-desktop-table/on-chain-desktop-table.component';
import { CrossChainTableService } from '@features/history/services/cross-chain-table-service/cross-chain-table.service';
import { OnChainTableService } from '@features/history/services/on-chain-table-service/on-chain-table.service';
import { CommonTableService } from '@features/history/services/common-table-service/common-table.service';
import { DepositTableService } from './services/cn-table-service/deposit-table.service';
import { DepositTableComponent } from './components/deposit-table/deposit-table.component';

@NgModule({
  declarations: [
    HistoryViewComponent,
    HistoryHeaderComponent,
    HistoryTableComponent,
    CrossChainDesktopTableComponent,
    OnChainDesktopTableComponent,
    DepositTableComponent
  ],
  imports: [
    CommonModule,
    HistoryRoutingModule,
    SharedModule,
    ...TuiTabs,
    TuiIcon,
    InlineSVGModule,
    ...TuiTable,
    TuiLoader,
    TuiTablePagination,
    TuiBadge,
    TuiPagination,
    ...TuiSelect,
    ...TuiDataListWrapper,
    ReactiveFormsModule,
    TuiButton,
    ...TuiHint
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [CommonTableService, CrossChainTableService, OnChainTableService, DepositTableService]
})
export class HistoryModule {}
