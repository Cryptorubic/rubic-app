import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TradesRoutingModule } from './trades-routing.module';
import { TradesPageComponent } from './components/trades-page/trades-page.component';

@NgModule({
  declarations: [TradesPageComponent],
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
