import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RailgunFormComponent } from '@features/privacy/providers/railgun/components/railgun-form/railgun-form.component';
import { SharedModule } from '@shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TuiFieldErrorPipeModule,
  TuiInputModule,
  TuiInputPasswordModule,
  TuiStepperModule
} from '@taiga-ui/kit';
import { TuiButtonModule, TuiErrorModule } from '@taiga-ui/core';
import { RouterModule } from '@angular/router';
import { RailgunMainPageComponent } from '@features/privacy/providers/railgun/components/railgun-main-page/railgun-main-page.component';
import { RailgunPageNavigationComponent } from '@features/privacy/providers/railgun/components/railgun-page-navigation/railgun-page-navigation.component';
import { RailgunHideTokensPageComponent } from '@features/privacy/providers/railgun/components/railgun-hide-tokens-page/railgun-hide-tokens-page.component';
import { RailgunSwapPageComponent } from '@features/privacy/providers/railgun/components/railgun-swap-page/railgun-swap-page.component';
import { RailgunRevealPageComponent } from '@features/privacy/providers/railgun/components/railgun-reveal-page/railgun-reveal-page.component';
import { RailgunAccountInfoComponent } from '@features/privacy/providers/railgun/components/railgun-account-info/railgun-account-info.component';
import { PrivacySharedModule } from '@features/privacy/shared/privacy-shared.module';
import { RailgunTransferPageComponent } from '@features/privacy/providers/railgun/components/railgun-transfer-page/railgun-transfer-page.component';

@NgModule({
  declarations: [
    RailgunMainPageComponent,
    RailgunAccountInfoComponent,
    RailgunFormComponent,
    RailgunPageNavigationComponent,
    RailgunHideTokensPageComponent,
    RailgunSwapPageComponent,
    RailgunRevealPageComponent,
    RailgunTransferPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: RailgunMainPageComponent }]),
    SharedModule,
    ReactiveFormsModule,
    TuiInputModule,
    TuiInputPasswordModule,
    TuiErrorModule,
    TuiFieldErrorPipeModule,
    TuiButtonModule,
    TuiStepperModule,
    PrivacySharedModule
  ]
})
export class RailgunModule {}
