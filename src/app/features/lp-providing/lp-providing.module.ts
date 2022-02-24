import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpProvidingRoutingModule } from './lp-providing-routing.module';
import { LpProvidingService } from './services/lp-providing.service';
import { LpProvidingApiService } from './services/lp-providing-api.service';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';
import { DepositCardComponent } from './components/deposit-card/deposit-card.component';
import { SharedModule } from '@app/shared/shared.module';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { TuiProgressModule, TuiSliderModule, TuiTagModule, TuiToggleModule } from '@taiga-ui/kit';
import { TuiLoaderModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LpLandingComponent } from './components/lp-landing/lp-landing.component';
import { LpProgressComponent } from './components/lp-progress/lp-progress.component';
import { LpInfoComponent } from './components/lp-info/lp-info.component';
import { LpStepsComponent } from './components/lp-steps/lp-steps.component';
import { DepositsComponent } from './components/deposits/deposits.component';
import { LpProvidingNotificationsService } from './services/lp-providing-notifications.service';
import { LpProvidingModalsService } from './services/lp-providing-modals.service';
import { StakeModalComponent } from './components/stake-modal/stake-modal.component';
import { WithdrawModalComponent } from './components/withdraw-modal/withdraw-modal.component';

@NgModule({
  declarations: [
    StakeButtonComponent,
    DepositCardComponent,
    DepositFormComponent,
    LpLandingComponent,
    LpProgressComponent,
    LpInfoComponent,
    LpStepsComponent,
    DepositsComponent,
    StakeModalComponent,
    WithdrawModalComponent
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
    TuiTagModule,
    TuiToggleModule
  ],
  exports: [],
  providers: [
    LpProvidingService,
    LpProvidingApiService,
    LpProvidingNotificationsService,
    LpProvidingModalsService
  ]
})
export class LpProvidingModule {}
