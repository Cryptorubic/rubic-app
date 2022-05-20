import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiDataListModule,
  TuiDropdownControllerModule,
  TuiGroupModule,
  TuiHintModule,
  TuiHostedDropdownModule
} from '@taiga-ui/core';
import { IframeLogoutButtonComponent } from '@app/root-components/header/components/iframe-logout-button/iframe-logout-button.component';
import { TuiBadgeModule, TuiToggleModule } from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { FormsModule } from '@angular/forms';
import { LoginButtonComponent } from 'src/app/root-components/header/components/login-button/login-button.component';
import { MobileMenuTogglerComponent } from 'src/app/root-components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from 'src/app/root-components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from '@app/root-components/header/header.component';
import { MenuComponent } from '@app/root-components/header/components/menu/menu.component';
import { IframeSettingsButtonComponent } from 'src/app/root-components/header/components/iframe-settings-button/iframe-settings-button.component';
import { HeaderSettingsComponent } from 'src/app/root-components/header/components/header-settings/header-settings.component';
import { SettingsElementComponent } from 'src/app/root-components/header/components/settings-element/settings-element.component';
import { SettingsListComponent } from 'src/app/root-components/header/components/settings-list/settings-list.component';
import { SettingsComponent } from 'src/app/root-components/header/components/settings/settings.component';
import { CurrentLanguageComponent } from 'src/app/root-components/header/components/current-language/current-language.component';
import { TutorialsComponent } from 'src/app/root-components/header/components/tutorials/tutorials.component';
import { ThemeSwitcherComponent } from 'src/app/root-components/header/components/theme-switcher/theme-switcher.component';
import { ExternalLinkBannerComponent } from 'src/app/root-components/header/components/external-link-banner/external-link-banner.component';
import { BannerDirective } from 'src/app/root-components/header/directives/banner.directive';
import { TradingBannerComponent } from '@app/root-components/header/components/trading-banner/trading-banner.component';
import { AppReferralBannerComponent } from 'src/app/root-components/header/components/referral-banner/app-referral-banner.component';
import { LanguageSelectComponent } from '@app/root-components/header/components/language-select/language-select.component';

@NgModule({
  declarations: [
    HeaderComponent,
    LoginButtonComponent,
    UserProfileComponent,
    MobileMenuTogglerComponent,
    MenuComponent,
    IframeLogoutButtonComponent,
    IframeSettingsButtonComponent,
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
    AppReferralBannerComponent,
    LanguageSelectComponent
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
    FormsModule
  ],
  exports: [HeaderComponent, LoginButtonComponent]
})
export class HeaderModule {}
