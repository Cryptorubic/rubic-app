import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg';
import {
  TuiDataListModule,
  TuiGroupModule,
  TuiHintModule,
  TuiHostedDropdownModule
} from '@taiga-ui/core';
import { LoginButtonComponent } from './components/header/components/login-button/login-button.component';
import { MobileMenuTogglerComponent } from './components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { WalletsModalComponent } from './components/header/components/wallets-modal/wallets-modal.component';
import { RubicMenuComponent } from './components/header/components/rubic-menu/rubic-menu.component';
import { CoinbaseConfirmModalComponent } from './components/header/components/coinbase-confirm-modal/coinbase-confirm-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    LoginButtonComponent,
    UserProfileComponent,
    MobileMenuTogglerComponent,
    WalletsModalComponent,
    RubicMenuComponent,
    CoinbaseConfirmModalComponent
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
    TuiGroupModule
  ],
  exports: [HeaderComponent, LoginButtonComponent],
  entryComponents: [WalletsModalComponent]
})
export class HeaderModule {}
