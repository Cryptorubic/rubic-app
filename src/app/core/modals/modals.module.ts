import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { modalServiceFactory } from './modal-service-factory';
import { WindowWidthService } from '../services/widnow-width-service/window-width.service';
import { AbstractModalService } from './services/abstract-modal.service';
import { MobileNativeModalComponent } from './components/mobile-native-modal/mobile-native-modal.component';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiSwipeModule } from '@taiga-ui/cdk';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, PolymorpheusModule, InlineSVGModule, TuiSwipeModule],
  declarations: [MobileNativeModalComponent],
  providers: [
    {
      provide: AbstractModalService,
      useFactory: modalServiceFactory,
      deps: [WindowWidthService, Injector]
    }
  ]
})
export class ModalsModule {}
