import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestnetPromoRoutingModule } from '@features/testnet-promo/testnet-promo-routing.module';
import { PromoPageComponent } from './components/promo-page/promo-page.component';
import { TestnetPromoService } from '@features/testnet-promo/testnet-promo.service';
import { SharedModule } from '@shared/shared.module';
import { PepeComponent } from './components/pepe/pepe.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TotalRbcComponent } from './components/total-rbc/total-rbc.component';
import { RulesComponent } from './components/rules/rules.component';
import { TuiAccordionModule } from '@taiga-ui/kit';
import { FaqComponent } from './components/faq/faq.component';
import { ActionButtonsComponent } from './components/action-buttons/action-buttons.component';
import { TuiButtonModule, TuiLoaderModule, TuiScrollbarModule } from '@taiga-ui/core';
import { PromoClaimComponent } from './components/promo-claim/promo-claim.component';
import { TestnetPromoApiService } from '@features/testnet-promo/services/testnet-promo-api.service';
import { FinishComponent } from '@features/testnet-promo/components/finish/finish.component';
import { ActiveClaimComponent } from './components/active-claim/active-claim.component';
import { TestnetPromoClaimService } from '@features/testnet-promo/services/testnet-promo-claim.service';
import { InactiveClaimComponent } from '@features/testnet-promo/components/inactive-claim/inactive-claim.component';

@NgModule({
  declarations: [
    PromoPageComponent,
    PepeComponent,
    TotalRbcComponent,
    RulesComponent,
    FaqComponent,
    ActionButtonsComponent,
    PromoClaimComponent,
    FinishComponent,
    ActiveClaimComponent,
    InactiveClaimComponent
  ],
  imports: [
    CommonModule,
    TestnetPromoRoutingModule,
    SharedModule,
    InlineSVGModule,
    TuiAccordionModule,
    TuiButtonModule,
    TuiScrollbarModule,
    TuiLoaderModule
  ],
  providers: [TestnetPromoService, TestnetPromoApiService, TestnetPromoClaimService]
})
export class TestnetPromoModule {}
