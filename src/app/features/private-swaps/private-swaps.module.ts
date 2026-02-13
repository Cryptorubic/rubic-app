import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrivateSwapsViewComponent } from './components/private-swaps-view/private-swaps-view.component';
import {
  TuiTabsModule,
  TuiSelectModule,
  TuiInputModule,
  TuiDataListWrapperModule
} from '@taiga-ui/kit';
import { TuiButtonModule, TuiTextfieldControllerModule, TuiDataListModule } from '@taiga-ui/core';
import { PrivateSwapsRoutingModule } from './private-swaps-routing.module';
import { SharedModule } from '@app/shared/shared.module';
import { PrivacyCashRevertService } from './services/privacy-cash-revert.service';
import { PrivacyCashSwapService } from './services/privacy-cash-swap.service';
import { PrivacyCashApiService } from './services/privacy-cash-api.service';

@NgModule({
  declarations: [PrivateSwapsViewComponent],
  providers: [PrivacyCashRevertService, PrivacyCashSwapService, PrivacyCashApiService],
  imports: [
    CommonModule,
    SharedModule,
    PrivateSwapsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TuiTabsModule,
    TuiSelectModule,
    TuiInputModule,
    TuiButtonModule,
    TuiDataListWrapperModule,
    TuiDataListModule,
    TuiTextfieldControllerModule
  ]
})
export class PrivateSwapsModule {}
