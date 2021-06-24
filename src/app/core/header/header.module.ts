import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InlineSVGModule } from 'ng-inline-svg';
import { TuiDataListModule, TuiHintModule } from '@taiga-ui/core';
import { LoginButtonComponent } from './components/header/components/login-button/login-button.component';
import { LogoutConfirmModalComponent } from './components/header/components/logout-confirm-modal/logout-confirm-modal.component';
import { MobileMenuTogglerComponent } from './components/header/components/mobile-menu-toggler/mobile-menu-toggler.component';
import { UserProfileComponent } from './components/header/components/user-profile/user-profile.component';
import { HeaderComponent } from './components/header/header.component';
import { WalletsModalComponent } from './components/header/components/wallets-modal/wallets-modal.component';

@NgModule({
  declarations: [
    HeaderComponent,
    LoginButtonComponent,
    UserProfileComponent,
    LogoutConfirmModalComponent,
    MobileMenuTogglerComponent,
    WalletsModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    RouterModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatMenuModule,
    A11yModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    TuiDataListModule,
    TuiHintModule
  ],
  exports: [HeaderComponent, LoginButtonComponent],
  entryComponents: [WalletsModalComponent]
})
export class HeaderModule {}
