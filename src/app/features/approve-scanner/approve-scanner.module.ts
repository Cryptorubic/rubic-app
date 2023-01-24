import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApproveScannerPageComponent } from './components/approve-scanner-page/approve-scanner-page.component';
import { ApproveScannerRoutingModule } from '@features/approve-scanner/approve-scanner-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiIslandModule,
  TuiSelectModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiHintControllerModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SharedModule } from '@shared/shared.module';
import { FormComponent } from './components/form/form.component';
import { TableComponent } from './components/table/table.component';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { RevokeModalComponent } from './components/revoke-modal/revoke-modal.component';
import { OverviewPageComponent } from './components/overview-page/overview-page.component';
import { TuiTablePaginationModule } from '@taiga-ui/addon-table';
import { DesktopTableComponent } from './components/desktop-table/desktop-table.component';
import { MobileTableComponent } from './components/mobile-table/mobile-table.component';

@NgModule({
  declarations: [
    ApproveScannerPageComponent,
    FormComponent,
    TableComponent,
    RevokeModalComponent,
    OverviewPageComponent,
    DesktopTableComponent,
    MobileTableComponent
  ],
  imports: [
    CommonModule,
    ApproveScannerRoutingModule,
    ReactiveFormsModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiHintControllerModule,
    TuiInputModule,
    TuiDataListWrapperModule,
    SharedModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiTablePaginationModule,
    TuiLoaderModule
  ],
  providers: [ApproveScannerService]
})
export class ApproveScannerModule {}
