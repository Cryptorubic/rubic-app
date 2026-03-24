import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyRoutingModule } from './privacy-routing.module';
import { PrivacyPageViewComponent } from './components/privacy-page-view/privacy-page-view.component';
import { PrivacyMainPageService } from './services/privacy-main-page.service';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { SharedModule } from '@app/shared/shared.module';
import { PrivateProvidersListGeneralComponent } from './components/private-providers-list-general/private-providers-list-general.component';
import { PrivateProvidersListComponent } from './components/private-providers-list/private-providers-list.component';
import { PrivateProviderElementComponent } from './components/private-provider-element/private-provider-element.component';
import { TuiButtonModule, TuiHintModule, TuiScrollbarModule } from '@taiga-ui/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { LastPrivateActivityComponent } from './components/last-private-activity/last-private-activity.component';
import { LastPrivateActivityElementComponent } from './components/last-private-activity-element/last-private-activity-element.component';
import { PrivacyAuthWindowComponent } from './components/privacy-auth-window/privacy-auth-window.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderModule } from '@app/core/header/header.module';
import { SharedTradeModule } from '@features/trade/shared-trade.module';
import { SharedPrivacyProvidersModule } from './providers/shared-privacy-providers/shared-privacy-providers.module';
import { PrivacyApiService } from './services/privacy-api.service';
import { PrivatePageSwapComponent } from '@app/features/privacy/components/private-page-swap/private-page-swap.component';
import { PrivateSwapWindowService } from './providers/shared-privacy-providers/services/private-swap-window/private-swap-window.service';
import { PrivateLocalStorageService } from './services/privacy-local-storage.service';

@NgModule({
  declarations: [
    PrivacyPageViewComponent,
    TabBarComponent,
    PrivateProvidersListGeneralComponent,
    PrivateProvidersListComponent,
    PrivateProviderElementComponent,
    LastPrivateActivityComponent,
    LastPrivateActivityElementComponent,
    PrivacyAuthWindowComponent,
    PrivatePageSwapComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PrivacyRoutingModule,
    TuiScrollbarModule,
    InlineSVGModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderModule,
    TuiButtonModule,
    SharedTradeModule,
    SharedPrivacyProvidersModule,
    TuiHintModule
  ],
  providers: [PrivacyMainPageService, PrivacyApiService, PrivateSwapWindowService]
})
export class PrivacyModule {
  constructor(private readonly privateLocalStorageService: PrivateLocalStorageService) {
    this.privateLocalStorageService.initStorage();
  }
}
