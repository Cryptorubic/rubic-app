import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { TradesRoutingModule } from './trades-routing.module';
import { TradesPageComponent } from './components/trades-page/trades-page.component';
import { TradesTableComponent } from './components/trades-table/trades-table.component';

@NgModule({
  declarations: [TradesPageComponent, TradesTableComponent],
  imports: [
    CommonModule,
    TradesRoutingModule,
    SharedModule,
    TranslateModule,
    FormsModule,
    ClipboardModule,
    MatTableModule,
    MatSortModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class TradesModule {}
