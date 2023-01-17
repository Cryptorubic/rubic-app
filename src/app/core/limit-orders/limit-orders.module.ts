import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LimitOrdersComponent } from 'src/app/core/limit-orders/components/limit-orders/limit-orders.component';
import { TuiLoaderModule, TuiScrollbarModule } from '@taiga-ui/core';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { OrderRowComponent } from 'src/app/core/limit-orders/components/order-row/order-row.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [LimitOrdersComponent, OrderRowComponent],
  imports: [
    CommonModule,
    TuiLoaderModule,
    SharedModule,
    TranslateModule,
    TuiScrollbarModule,
    ScrollingModule
  ],
  exports: [LimitOrdersComponent],
  providers: []
})
export class LimitOrdersModule {}
