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
  TuiHostedDropdownModule
} from '@taiga-ui/core';
import { IframeLogoutButtonComponent } from 'src/app/core/header/components/header/components/iframe-logout-button/iframe-logout-button.component';
import { TuiBadgeModule, TuiToggleModule } from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { FormsModule } from '@angular/forms';
import { LoginButtonComponent } from './components/header/components/login-button/login-button.component';
import { MobileMenuTogglerComponent } from './components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { RubicMenuComponent } from './components/header/components/rubic-menu/rubic-menu.component';
import { IframeSettingsButtonComponent } from './components/header/components/iframe-settings-button/iframe-settings-button.component';
import { HeaderSettingsComponent } from './components/header/components/header-settings/header-settings.component';
import { SettingsElementComponent } from './components/header/components/settings-element/settings-element.component';
import { SettingsListComponent } from './components/header/components/settings-list/settings-list.component';
import { SettingsComponent } from './components/header/components/settings/settings.component';
import { CurrentLanguageComponent } from './components/header/components/current-language/current-language.component';
import { TutorialsComponent } from './components/header/components/tutorials/tutorials.component';
import { ThemeSwitcherComponent } from './components/header/components/theme-switcher/theme-switcher.component';
import { BannerComponent } from './components/header/components/banner/banner.component';

@NgModule({
  declarations: [
    HeaderComponent,
    LoginButtonComponent,
    UserProfileComponent,
    MobileMenuTogglerComponent,
    RubicMenuComponent,
    IframeLogoutButtonComponent,
    IframeSettingsButtonComponent,
    HeaderSettingsComponent,
    SettingsElementComponent,
    SettingsListComponent,
    SettingsComponent,
    CurrentLanguageComponent,
    TutorialsComponent,
    ThemeSwitcherComponent,
    BannerComponent
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
