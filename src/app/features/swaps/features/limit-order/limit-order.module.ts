import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { LimitOrderBottomFormComponent } from './components/limit-order-bottom-form/limit-order-bottom-form.component';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';

@NgModule({
  declarations: [LimitOrderBottomFormComponent],
  providers: [LimitOrderFormService],
  exports: [LimitOrderBottomFormComponent],
  imports: [SwapsSharedModule]
})
export class LimitOrderModule {}
