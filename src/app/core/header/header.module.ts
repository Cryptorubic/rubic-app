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
  TuiButtonModule,
  TuiDataListModule,
  TuiDialogModule,
  TuiDropdownModule,
  TuiGroupModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiLoaderModule
} from '@taiga-ui/core';
import {
  TuiAccordionModule,
  TuiBadgeModule,
  TuiCarouselModule,
  TuiToggleModule
} from '@taiga-ui/kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';
import { FormsModule } from '@angular/forms';
import { MobileMenuTogglerComponent } from './components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { RubicMenuComponent } from './components/header/components/rubic-menu/rubic-menu.component';
import { ThemeSwitcherComponent } from './components/header/components/theme-switcher/theme-switcher.component';
import { ExternalLinkBannerComponent } from './components/header/components/external-link-banner/external-link-banner.component';
import { BannerDirective } from './components/header/directives/banner.directive';
import { BannerZkLinkComponent } from '@core/header/components/header/components/banner-zk-link/banner-zk-link.component';
import { MobileMenuComponent } from './components/header/components/mobile-menu/mobile-menu.component';
import { ModalsModule } from '../modals/modals.module';
import { RubicMenuTogglerComponent } from './components/header/components/rubic-menu-toggler/rubic-menu-toggler.component';
import { MobileUserProfileComponent } from './components/header/components/mobile-user-profile/mobile-user-profile.component';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MobileNavigationMenuComponent } from './components/header/components/mobile-navigation-menu/mobile-navigation-menu.component';
import { LogoComponent } from './components/header/components/logo/logo.component';
import { LanguageSelectorComponent } from './components/header/components/language-selector/language-selector.component';
import { SettingsComponent } from '@core/header/components/header/components/settings/settings.component';
import { ProfileMenuTogglerComponent } from '@core/header/components/header/components/profile-menu-toggler/profile-menu-toggler.component';
import { HistoryButtonComponent } from './components/header/components/hisory-button/history-button.component';
import { BannerTaikoComponent } from './components/header/components/banner-taiko/banner-taiko.component';
import { BannerBirthdayComponent } from '@core/header/components/header/components/banner-bday/banner-birthday.component';
import { BannerMonadTestnetComponent } from './components/header/components/banner-monad-testnet/banner-monad-testnet.component';
import { ZeroFeesBannerComponent } from './components/header/components/zero-fees-banner/zero-fees-banner.component';
import { BannerTestPromoComponent } from '@core/header/components/header/components/banner-testnet-promo/banner-test-promo.component';

@NgModule({
  declarations: [
    HeaderComponent,
    UserProfileComponent,
    MobileMenuTogglerComponent,
    RubicMenuComponent,
    ThemeSwitcherComponent,
    ExternalLinkBannerComponent,
    BannerDirective,
    BannerZkLinkComponent,
    MobileMenuComponent,
    RubicMenuTogglerComponent,
    MobileUserProfileComponent,
    MobileNavigationMenuComponent,
    LogoComponent,
    LanguageSelectorComponent,
    SettingsComponent,
    ProfileMenuTogglerComponent,
    HistoryButtonComponent,
    BannerTaikoComponent,
    BannerBirthdayComponent,
    BannerMonadTestnetComponent,
    ZeroFeesBannerComponent,
    BannerTestPromoComponent
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
    TuiDropdownModule,
    TuiToggleModule,
    FormsModule,
    TuiLoaderModule,
    ModalsModule,
    ClipboardModule,
    TuiAccordionModule,
    TuiDialogModule,
    TuiButtonModule,
    TuiCarouselModule
  ],
  providers: [TuiDestroyService],
  exports: [HeaderComponent]
})
export class HeaderModule {}
