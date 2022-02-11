import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpProvidingRoutingModule } from './lp-providing-routing.module';
import { LpProvidingService } from './services/lp-providing.service';
import { LpProvidingApiService } from './services/lp-providing-api.service';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';
import { DepositCardComponent } from './components/deposit-card/deposit-card.component';
import { LpProvidingPageComponent } from './components/lp-providing-page/lp-providing-page.component';
import { SharedModule } from '@app/shared/shared.module';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { TuiProgressModule, TuiSliderModule, TuiTagModule } from '@taiga-ui/kit';
import { TuiLoaderModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    StakeButtonComponent,
    DepositCardComponent,
    LpProvidingPageComponent,
    DepositFormComponent
  ],
  imports: [
    CommonModule,
    TuiLoaderModule,
    LpProvidingRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    TuiLoaderModule,
    TuiSliderModule,
    TuiProgressModule,
    TuiTagModule
  ],
  exports: [],
  providers: [LpProvidingService, LpProvidingApiService]
})
export class LpProvidingModule {}
