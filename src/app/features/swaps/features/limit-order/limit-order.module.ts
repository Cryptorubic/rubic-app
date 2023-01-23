import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { LimitOrderBottomFormComponent } from './components/limit-order-bottom-form/limit-order-bottom-form.component';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';
import { OrderRateComponent } from './components/order-rate/order-rate.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import { ExpiresInComponent } from './components/expires-in/expires-in.component';
import { TuiInputNumberModule } from '@taiga-ui/kit';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';

@NgModule({
  declarations: [LimitOrderBottomFormComponent, OrderRateComponent, ExpiresInComponent],
  providers: [LimitOrderFormService, OrderRateService],
  exports: [LimitOrderBottomFormComponent],
  imports: [
    SwapsSharedModule,
    ReactiveFormsModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule
  ]
})
export class LimitOrderModule {}
