import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LpProvidingRoutingModule } from './lp-providing-routing.module';
import { LpProvidingService } from './services/lp-providing.service';
import { LpProvidingApiService } from './services/lp-providing-api.service';
import { StakeButtonComponent } from './components/stake-button/stake-button.component';
import { DepositComponent } from './components/deposit/deposit.component';
import { LpProvidingPage } from './components/lp-providing-page/lp-providing-page.component';

@NgModule({
  declarations: [StakeButtonComponent, DepositComponent, LpProvidingPage],
  imports: [CommonModule, LpProvidingRoutingModule],
  exports: [],
  providers: [LpProvidingService, LpProvidingApiService]
})
export class LpProvidingModule {}
