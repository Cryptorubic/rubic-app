import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { LimitOrderBottomFormComponent } from './components/limit-order-bottom-form/limit-order-bottom-form.component';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';
import { OrderRateComponent } from './components/order-rate/order-rate.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';

@NgModule({
  declarations: [LimitOrderBottomFormComponent, OrderRateComponent],
  providers: [LimitOrderFormService, OrderRateService],
  exports: [LimitOrderBottomFormComponent],
  imports: [SwapsSharedModule, ReactiveFormsModule]
})
export class LimitOrderModule {}
