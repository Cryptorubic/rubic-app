import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RetrodropContainerComponent } from '@features/retrodrop/components/retrodrop-container/retrodrop-container.component';
import { RetrodropStakeModalComponent } from '@features/retrodrop/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { RetrodropRoutingModule } from '@features/retrodrop/retrodrop-routing.module';
import { RetrodropPageComponent } from '@features/retrodrop/components/retrodrop-page/retrodrop-page.component';

@NgModule({
  declarations: [
    RetrodropPageComponent,
    RetrodropContainerComponent,
    RetrodropStakeModalComponent,
    RetrodropContainerComponent
  ],
  imports: [
    CommonModule,
    RetrodropRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TuiHintModule,
    TuiInputModule,
    InlineSVGModule,
    TuiTextfieldControllerModule,
    TuiScrollbarModule,
    TuiLoaderModule,
    TuiButtonModule
  ],
  providers: []
})
export class RetrodropModule {}
