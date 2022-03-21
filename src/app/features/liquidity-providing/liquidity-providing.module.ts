import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidityProvidingRoutingModule } from './liquidity-providing-routing.module';
import { LiquidityProvidingService } from './services/liquidity-providing.service';
import { DepositButtonComponent } from './components/deposit-button/deposit-button.component';
import { DepositCardComponent } from './components/deposit-card/deposit-card.component';
import { SharedModule } from '@app/shared/shared.module';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { TuiProgressModule, TuiSliderModule, TuiTagModule, TuiToggleModule } from '@taiga-ui/kit';
import { TuiLoaderModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LpPageComponent } from './components/lp-page/lp-page.component';
import { LpProgressComponent } from './components/lp-progress/lp-progress.component';
import { LpInfoComponent } from './components/lp-info/lp-info.component';
import { LpLandingComponent } from './components/lp-landing/lp-landing.component';
import { DepositsComponent } from './components/deposits/deposits.component';
import { LiquidityProvidingNotificationsService } from './services/liquidity-providing-notifications.service';
import { LiquidityProvidingModalsService } from './services/liquidity-providing-modals.service';
import { DepositModalComponent } from './components/deposit-modal/deposit-modal.component';
import { WithdrawModalComponent } from './components/withdraw-modal/withdraw-modal.component';

@NgModule({
  declarations: [
    DepositButtonComponent,
    DepositCardComponent,
    DepositFormComponent,
    LpPageComponent,
    LpProgressComponent,
    LpInfoComponent,
    LpLandingComponent,
    DepositsComponent,
    DepositModalComponent,
    WithdrawModalComponent
  ],
  imports: [
    CommonModule,
    TuiLoaderModule,
    LiquidityProvidingRoutingModule,
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
    LiquidityProvidingService,
    LiquidityProvidingNotificationsService,
    LiquidityProvidingModalsService
  ]
})
export class LiquidityProvidingModule {}
