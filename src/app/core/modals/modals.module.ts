import { PolymorpheusTemplate, PolymorpheusOutlet } from '@taiga-ui/polymorpheus';
import { TuiSwipe } from '@taiga-ui/cdk';
import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { modalServiceFactory } from './modal-service-factory';
import { WindowWidthService } from '../services/widnow-width-service/window-width.service';
import { AbstractModalService } from './services/abstract-modal.service';
import { MobileNativeModalComponent } from './components/mobile-native-modal/mobile-native-modal.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    PolymorpheusTemplate,
    PolymorpheusOutlet,
    InlineSVGModule,
    TuiSwipe
  ],
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
