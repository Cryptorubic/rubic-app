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
import { TuiBadgeModule, TuiToggleModule } from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { FormsModule } from '@angular/forms';
import { LoginButtonComponent } from './components/header/components/login-button/login-button.component';
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
import { AppReferralBannerComponent } from './components/header/components/referral-banner/app-referral-banner.component';

@NgModule({
  declarations: [
    HeaderComponent,
    LoginButtonComponent,
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
    AppReferralBannerComponent
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
    TuiLoaderModule
  ],
  exports: [HeaderComponent, LoginButtonComponent]
})
export class HeaderModule {}
