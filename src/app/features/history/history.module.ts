import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryViewComponent } from './components/history-view/history-view.component';
import { HistoryRoutingModule } from '@features/history/history-routing.module';
import { SharedModule } from '@shared/shared.module';
import { HistoryHeaderComponent } from './components/hisory-header/history-header.component';
import {
  TuiBadge,
  TuiDataListWrapper,
  TuiPagination,
  TuiSelect,
  TuiTabs
} from '@taiga-ui/kit';
import {
  TuiButton,
  TuiLoader,
  TuiIcon,
  TuiTextfield,
  TuiHint
} from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { HistoryTableComponent } from './components/history-table/history-table.component';
import { TuiTable, TuiTablePagination } from '@taiga-ui/addon-table';
import { TuiLet } from '@taiga-ui/cdk';
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
    ...(TuiTabs as unknown as any[]),
    TuiIcon,
    InlineSVGModule,
    ...(TuiTable as unknown as any[]),
    TuiLoader,
    TuiTablePagination,
    TuiLet,
    TuiBadge,
    TuiPagination,
    ...(TuiSelect as unknown as any[]),
    ...(TuiTextfield as unknown as any[]),
    ...(TuiDataListWrapper as unknown as any[]),
    ReactiveFormsModule,
    TuiButton,
    ...(TuiHint as unknown as any[])
  ],
  providers: [CommonTableService, CrossChainTableService, OnChainTableService, DepositTableService]
})
export class HistoryModule {}
