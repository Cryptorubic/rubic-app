import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiGroupModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule
} from '@taiga-ui/core';
import { TuiBadgeModule, TuiToggleModule, TuiAccordionModule } from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { FormsModule } from '@angular/forms';
import { MobileMenuTogglerComponent } from './components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { RubicMenuComponent } from './components/header/components/rubic-menu/rubic-menu.component';
import { HeaderSettingsComponent } from './components/header/components/header-settings/header-settings.component';
import { SettingsElementComponent } from './components/header/components/settings-element/settings-element.component';
import { SettingsListComponent } from './components/header/components/settings-list/settings-list.component';
import { SettingsComponent } from './components/header/components/settings/settings.component';
import { CurrentLanguageComponent } from './components/header/components/current-language/current-language.component';
import { TutorialsComponent } from './components/header/components/tutorials/tutorials.component';
import { ThemeSwitcherComponent } from './components/header/components/theme-switcher/theme-switcher.component';
import { ExternalLinkBannerComponent } from './components/header/components/external-link-banner/external-link-banner.component';
import { BannerDirective } from './components/header/directives/banner.directive';
import { TradingBannerComponent } from '@core/header/components/header/components/trading-banner/trading-banner.component';
import { BannerComponent } from './components/header/components/banner/app-banner.component';
import { MobileMenuComponent } from './components/header/components/mobile-menu/mobile-menu.component';
import { ModalsModule } from '../modals/modals.module';
import { RubicMenuTogglerComponent } from './components/header/components/rubic-menu-toggler/rubic-menu-toggler.component';
import { SettingsTogglerComponent } from './components/header/components/settings-toggler/settings-toggler.component';
import { MobileUserProfileComponent } from './components/header/components/mobile-user-profile/mobile-user-profile.component';
import { RecentTradesModule } from '../recent-trades/recent-trades.module';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { HistoryModule } from '@app/features/history/history.module';
import { InstantTradeModule } from '@app/features/swaps/features/instant-trade/instant-trade.module';
import { MobileNavigationMenuComponent } from './components/header/components/mobile-navigation-menu/mobile-navigation-menu.component';
import { PointsButtonComponent } from './components/header/components/points-button/points-button.component';

@NgModule({
  declarations: [
    HeaderComponent,
    UserProfileComponent,
    MobileMenuTogglerComponent,
    RubicMenuComponent,
    HeaderSettingsComponent,
    SettingsElementComponent,
    SettingsListComponent,
    SettingsComponent,
    CurrentLanguageComponent,
    TutorialsComponent,
    ThemeSwitcherComponent,
    TradingBannerComponent,
    ExternalLinkBannerComponent,
    BannerDirective,
    BannerComponent,
    MobileMenuComponent,
    RubicMenuTogglerComponent,
    SettingsTogglerComponent,
    MobileUserProfileComponent,
    MobileNavigationMenuComponent,
    PointsButtonComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    RouterModule,
    BrowserAnimationsModule,
    A11yModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    TuiDataListModule,
    TuiHintModule,
    TuiHostedDropdownModule,
    TuiGroupModule,
    TuiBadgeModule,
    PolymorpheusModule,
    TuiDropdownControllerModule,
    TuiToggleModule,
    FormsModule,
    TuiLoaderModule,
    ModalsModule,
    RecentTradesModule,
    ClipboardModule,
    HistoryModule,
    InstantTradeModule,
    TuiAccordionModule
  ],
  providers: [TuiDestroyService],
  exports: [HeaderComponent]
})
export class HeaderModule {}
