import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TradesRoutingModule } from './trades-routing.module';
import { ContractsPreviewV3Component } from './components/contracts-preview-v3/contracts-preview-v3.component';
import { ContractsListComponent } from './components/contracts-list/contracts-list.component';

@NgModule({
  declarations: [ContractsPreviewV3Component, ContractsListComponent],
  imports: [
    CommonModule,
    TradesRoutingModule,
    SharedModule,
    TranslateModule,
    FormsModule,
    ClipboardModule
  ]
})
export class TradesModule {}
