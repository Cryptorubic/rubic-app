import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { TokenSaleComponent } from '../components/token-sale/token-sale.component';
import { TokenSalePageRoutingModule } from './token-sale-page-routing.module';

@NgModule({
  declarations: [TokenSaleComponent],
  imports: [
    CommonModule,
    TokenSalePageRoutingModule,
    SharedModule,
    TranslateModule,
    FormsModule,
    ClipboardModule
  ]
})
export class TokenSalePageModule {}
