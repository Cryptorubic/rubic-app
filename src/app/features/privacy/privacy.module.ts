import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyRoutingModule } from './privacy-routing.module';
import { PrivacyPageViewComponent } from './components/privacy-page-view/privacy-page-view.component';
import { TradeModule } from '../trade/trade.module';
import { PrivacyFormService } from './services/privacy-form.service';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { SharedModule } from '@app/shared/shared.module';
import { PrivateProvidersListGeneralComponent } from './components/private-providers-list-general/private-providers-list-general.component';
import { PrivateProvidersListComponent } from './components/private-providers-list/private-providers-list.component';
import { PrivateProviderElementComponent } from './components/private-provider-element/private-provider-element.component';
import { TuiButtonModule, TuiScrollbarModule } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { LastPrivateActivityComponent } from './components/last-private-activity/last-private-activity.component';
import { LastPrivateActivityElementComponent } from './components/last-private-activity-element/last-private-activity-element.component';
import { PrivacyAuthWindowComponent } from './components/privacy-auth-window/privacy-auth-window.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '@app/core/header/header.module';
import { SharedTradeModule } from '@features/trade/shared-trade.module';

@NgModule({
  declarations: [
    PrivacyPageViewComponent,
    TabBarComponent,
    PrivateProvidersListGeneralComponent,
    PrivateProvidersListComponent,
    PrivateProviderElementComponent,
    LastPrivateActivityComponent,
    LastPrivateActivityElementComponent,
    PrivacyAuthWindowComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PrivacyRoutingModule,
    TradeModule,
    TuiScrollbarModule,
    InlineSVGModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    TuiButtonModule,
    SharedTradeModule
  ],
  providers: [PrivacyFormService]
})
export class PrivacyModule {}
