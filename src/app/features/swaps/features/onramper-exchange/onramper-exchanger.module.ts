import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { OnramperBottomFormComponent } from '@features/swaps/features/onramper-exchange/components/onramper-bottom-form/onramper-bottom-form.component';
import { OnramperWidgetComponent } from '@features/swaps/features/onramper-exchange/components/onramper-widget/onramper-widget.component';
import { OnramperWebsocketService } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/onramper-websocket.service';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form-calculation.service';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form-service/onramper-form.service';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation-service/onramper-calculation.service';
import { OnramperWidgetService } from '@features/swaps/features/onramper-exchange/services/onramper-widget-service/onramper-widget.service';
import { ReceiverAddressComponent } from './components/onramper-bottom-form/components/receiver-address/receiver-address.component';

@NgModule({
  declarations: [OnramperBottomFormComponent, OnramperWidgetComponent, ReceiverAddressComponent],
  exports: [OnramperBottomFormComponent, OnramperWidgetComponent],
  imports: [SwapsSharedModule],
  providers: [
    OnramperWebsocketService,
    OnramperFormCalculationService,
    OnramperFormService,
    OnramperCalculationService,
    OnramperWidgetService
  ]
})
export class OnramperExchangerModule {
  // Initialized services, which are not used directly in components
  constructor(_onramperWebsocketService: OnramperWebsocketService) {}
}
