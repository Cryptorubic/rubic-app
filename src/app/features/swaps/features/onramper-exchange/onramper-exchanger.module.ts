import { NgModule } from '@angular/core';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { OnramperBottomFormComponent } from '@features/swaps/features/onramper-exchange/components/onramper-bottom-form/onramper-bottom-form.component';
import { OnramperWidgetComponent } from '@features/swaps/features/onramper-exchange/components/onramper-widget/onramper-widget.component';
import { ReceiverAddressComponent } from './components/onramper-bottom-form/components/receiver-address/receiver-address.component';
import { OnramperWebsocketService } from '@features/swaps/features/onramper-exchange/services/onramper-websocket.service';
import { OnramperFormService } from '@features/swaps/features/onramper-exchange/services/onramper-form.service';
import { OnramperFormCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-form-calculation.service';
import { OnramperCalculationService } from '@features/swaps/features/onramper-exchange/services/onramper-calculation.service';
import { OnramperWidgetService } from '@features/swaps/features/onramper-exchange/services/onramper-widget.service';
import { OnramperApiService } from '@features/swaps/features/onramper-exchange/services/onramper-api.service';

@NgModule({
  declarations: [OnramperBottomFormComponent, OnramperWidgetComponent, ReceiverAddressComponent],
  exports: [OnramperBottomFormComponent, OnramperWidgetComponent],
  imports: [SwapsSharedModule],
  providers: [
    OnramperWebsocketService,
    OnramperFormCalculationService,
    OnramperFormService,
    OnramperCalculationService,
    OnramperWidgetService,
    OnramperApiService
  ]
})
export class OnramperExchangerModule {
  // Initialized services, which are not used directly in components
  constructor(_onramperWebsocketService: OnramperWebsocketService) {}
}
