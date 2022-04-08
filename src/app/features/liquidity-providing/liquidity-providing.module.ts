import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidityProvidingRoutingModule } from './liquidity-providing-routing.module';
import { LiquidityProvidingService } from './services/liquidity-providing.service';
import { DepositButtonComponent } from './components/deposit-button/deposit-button.component';
import { DepositCardComponent } from './components/deposit-card/deposit-card.component';
import { SharedModule } from '@app/shared/shared.module';
import { DepositFormComponent } from './components/deposit-form/deposit-form.component';
import { TuiProgressModule, TuiSliderModule, TuiTagModule } from '@taiga-ui/kit';
import { TuiLoaderModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LpPageComponent } from './components/lp-page/lp-page.component';
import { LpLandingComponent } from './components/lp-landing/lp-landing.component';
import { DepositsComponent } from './components/deposits/deposits.component';
import { LiquidityProvidingNotificationService } from './services/liquidity-providing-notification.service';
import { LiquidityProvidingModalService } from './services/liquidity-providing-modals.service';
import { DepositModalComponent } from './components/deposit-modal/deposit-modal.component';
import { WithdrawModalComponent } from './components/withdraw-modal/withdraw-modal.component';
import { LpStatisticsComponent } from './components/lp-statistics/lp-statistics.component';
import { ProgressComponent } from './components/progress/progress.component';
import { RequestWithdrawModalComponent } from './components/request-withdraw-modal/request-withdraw-modal.component';
import { LpRoundTimeGuard } from './guards/lp-round-time.guard';

@NgModule({
  declarations: [
    DepositButtonComponent,
    DepositCardComponent,
    DepositFormComponent,
    LpPageComponent,
    LpLandingComponent,
    DepositsComponent,
    DepositModalComponent,
    WithdrawModalComponent,
    LpStatisticsComponent,
    ProgressComponent,
    RequestWithdrawModalComponent
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
    TuiTagModule
  ],
  exports: [],
  providers: [
    LiquidityProvidingService,
    LiquidityProvidingNotificationService,
    LiquidityProvidingModalService,
    LpRoundTimeGuard
  ]
})
export class LiquidityProvidingModule {}
