import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { LimitOrderBottomFormComponent } from './components/limit-order-bottom-form/limit-order-bottom-form.component';
import { LimitOrderFormService } from '@features/swaps/features/limit-order/services/limit-order-form.service';
import { OrderRateComponent } from './components/order-rate/order-rate.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OrderRateService } from '@features/swaps/features/limit-order/services/order-rate.service';
import { ExpiresInComponent } from './components/expires-in/expires-in.component';
import { TuiInputNumberModule } from '@taiga-ui/kit';
import {
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiTextfieldControllerModule,
  TuiDropdownModule
} from '@taiga-ui/core';
import { OrderExpirationService } from '@features/swaps/features/limit-order/services/order-expiration.service';
import { ExpirationCustomComponent } from '@features/swaps/features/limit-order/components/expiration-custom/expiration-custom.component';
import { ExpirationOptionalComponent } from '@features/swaps/features/limit-order/components/expiration-optional/expiration-optional.component';
import { InlineSVGModule } from 'ng-inline-svg-2';

@NgModule({
  declarations: [
    LimitOrderBottomFormComponent,
    OrderRateComponent,
    ExpiresInComponent,
    ExpirationCustomComponent,
    ExpirationOptionalComponent
  ],
  providers: [LimitOrderFormService, OrderRateService, OrderExpirationService],
  exports: [LimitOrderBottomFormComponent],
  imports: [
    SwapsSharedModule,
    ReactiveFormsModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    TuiHostedDropdownModule,
    TuiDropdownModule,
    TuiHintModule,
    InlineSVGModule
  ]
})
export class LimitOrderModule {}
