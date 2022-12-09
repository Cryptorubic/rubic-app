import { APP_INITIALIZER, NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { SwapsSharedModule } from '@features/swaps/shared/swaps-shared.module';
import { CommonModule } from '@angular/common';
import { OnramperBottomFormComponent } from '@features/swaps/features/onramper-exchange/components/onramper-bottom-form/onramper-bottom-form.component';
import { OnramperWidgetComponent } from '@features/swaps/features/onramper-exchange/components/onramper-widget/onramper-widget.component';
import { OnramperWebsocketService } from '@features/swaps/features/onramper-exchange/services/onramper-websocket-service/onramper-websocket.service';

@NgModule({
  declarations: [OnramperBottomFormComponent, OnramperWidgetComponent],
  exports: [OnramperBottomFormComponent, OnramperWidgetComponent],
  imports: [CommonModule, SharedModule, SwapsSharedModule],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (onramperWebsocketService: OnramperWebsocketService) => () =>
        onramperWebsocketService,
      deps: [OnramperWebsocketService],
      multi: true
    }
  ]
})
export class OnramperExchangerModule {}
