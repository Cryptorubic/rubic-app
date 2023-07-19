import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApproveScannerPageComponent } from './components/approve-scanner-page/approve-scanner-page.component';
import { ApproveScannerRoutingModule } from '@features/approve-scanner/approve-scanner-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TextMaskModule,
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiIslandModule,
  TuiSelectModule
} from '@taiga-ui/kit';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SharedModule } from '@shared/shared.module';
import { FormComponent } from './components/form/form.component';
import { TableComponent } from './components/table/table.component';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { OverviewPageComponent } from './components/overview-page/overview-page.component';
import { TuiTablePaginationModule } from '@taiga-ui/addon-table';
import { DesktopTableComponent } from './components/desktop-table/desktop-table.component';
import { MobileTableComponent } from './components/mobile-table/mobile-table.component';
import { RevokeButtonComponent } from './components/revoke-button/revoke-button.component';
import { SwitchButtonComponent } from './components/switch-button/switch-button.component';

@NgModule({
  declarations: [
    ApproveScannerPageComponent,
    FormComponent,
    TableComponent,
    OverviewPageComponent,
    DesktopTableComponent,
    MobileTableComponent,
    RevokeButtonComponent,
    SwitchButtonComponent
  ],
  imports: [
    CommonModule,
    ApproveScannerRoutingModule,
    ReactiveFormsModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiHintModule,
    TuiInputModule,
    TuiDataListWrapperModule,
    SharedModule,
    TuiButtonModule,
    TuiIslandModule,
    TuiTablePaginationModule,
    TuiLoaderModule,
    TuiHintModule,
    TextMaskModule
  ],
  providers: [ApproveScannerService]
})
export class ApproveScannerModule {}
