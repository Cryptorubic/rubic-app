import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZamaPrivateSwapComponent } from './components/zama-private-swap/zama-private-swap.component';
import { PrivateSwapsRoutingModule } from './private-swaps-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { TuiDataListWrapperModule, TuiInputModule, TuiSelectModule } from '@taiga-ui/kit';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ZamaPrivateSwapComponent],
  imports: [
    CommonModule,
    PrivateSwapsRoutingModule,
    SharedModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiDataListWrapperModule,
    ReactiveFormsModule,
    TuiInputModule
  ],
  providers: []
})
export class PrivateSwapsModule {}
