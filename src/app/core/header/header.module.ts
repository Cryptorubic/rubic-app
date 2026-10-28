import { PolymorpheusTemplate, PolymorpheusOutlet } from '@taiga-ui/polymorpheus';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
// import { BrowsernimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiDataList,
  TuiLoader,
  TuiGroup,
  TuiDropdown,
  TuiDialog,
  TuiButton,
  TuiHint
} from '@taiga-ui/core';
import { TuiAccordion, TuiCarousel, TuiBadge, TuiSwitch } from '@taiga-ui/kit';
import { FormsModule } from '@angular/forms';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { RubicMenuComponent } from './components/header/components/rubic-menu/rubic-menu.component';
import { ThemeSwitcherComponent } from './components/header/components/theme-switcher/theme-switcher.component';
import { BannerDirective } from './components/header/directives/banner.directive';
import { ModalsModule } from '../modals/modals.module';
import { RubicMenuTogglerComponent } from './components/header/components/rubic-menu-toggler/rubic-menu-toggler.component';
import { MobileUserProfileComponent } from './components/header/components/mobile-user-profile/mobile-user-profile.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { LogoComponent } from './components/header/components/logo/logo.component';
import { SettingsComponent } from '@core/header/components/header/components/settings/settings.component';
import { ProfileMenuTogglerComponent } from '@core/header/components/header/components/profile-menu-toggler/profile-menu-toggler.component';
import { HistoryButtonComponent } from './components/header/components/hisory-button/history-button.component';
import { BannersComponent } from '@app/core/header/components/header/components/banners/banners.component';
import { BannersService } from './services/banners.service';
import { RubicMenuTogglerMobileComponent } from './components/header/components/rubic-menu-toggler-mobile/rubic-menu-toggler-mobile.component';

@NgModule({
  declarations: [
    HeaderComponent,
    UserProfileComponent,
    RubicMenuComponent,
    ThemeSwitcherComponent,
    BannerDirective,
    RubicMenuTogglerComponent,
    MobileUserProfileComponent,
    LogoComponent,
    SettingsComponent,
    ProfileMenuTogglerComponent,
    HistoryButtonComponent,
    BannersComponent,
    RubicMenuTogglerMobileComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    RouterModule,
    A11yModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    ...TuiDataList,
    ...TuiHint,
    ...TuiDropdown,
    TuiGroup,
    TuiBadge,
    PolymorpheusTemplate,
    PolymorpheusOutlet,
    TuiSwitch,
    FormsModule,
    TuiLoader,
    ModalsModule,
    ClipboardModule,
    ...TuiAccordion,
    TuiDialog,
    TuiButton,
    ...TuiCarousel
  ],
  providers: [BannersService],
  exports: [HeaderComponent, UserProfileComponent]
})
export class HeaderModule {}
