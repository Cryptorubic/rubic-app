import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { IndexPageRoutingModule } from './index-page-routing.module';
import { IndexComponent } from './components/index/index.component';
import { StartFormComponent } from './components/start-form/start-form.component';
import { PublicContractsComponent } from './components/public-contracts/public-contracts.component';
import { TradeInProgressModalComponent } from './components/trade-in-progress-modal/trade-in-progress-modal.component';
import { TradeSuccessModalComponent } from './components/trade-success-modal/trade-success-modal.component';

@NgModule({
  declarations: [
    IndexComponent,
    StartFormComponent,
    PublicContractsComponent,
    TradeInProgressModalComponent,
    TradeSuccessModalComponent
  ],
  imports: [
    CommonModule,
    IndexPageRoutingModule,
    TranslateModule,
    SharedModule,
    FormsModule,
    MatDatepickerModule,
    NgxMaterialTimepickerModule
  ]
})
export class IndexPageModule {}
