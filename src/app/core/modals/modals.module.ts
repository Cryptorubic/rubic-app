import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './services/modal.service';
import { modalServiceFactory } from './modal-service-factory';
import { WindowWidthService } from '../services/widnow-width-service/window-width.service';
import { AbstractModalService } from './services/abstract-modal.service';
import { MobileNativeModalComponent } from './components/mobile-native-modal/mobile-native-modal.component';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiSwipeModule } from '@taiga-ui/cdk';
import { SettingsService } from '@app/features/swaps/core/services/settings-service/settings.service';
import { TargetNetworkAddressService } from '@app/features/swaps/core/services/target-network-address-service/target-network-address.service';

@NgModule({
  imports: [CommonModule, PolymorpheusModule, InlineSVGModule, TuiSwipeModule],
  declarations: [MobileNativeModalComponent],
  providers: [
    ModalService,
    SettingsService,
    TargetNetworkAddressService,
    {
      provide: AbstractModalService,
      useFactory: modalServiceFactory,
      deps: [WindowWidthService, Injector]
    }
  ]
})
export class ModalsModule {}
