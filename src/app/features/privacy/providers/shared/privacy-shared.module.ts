import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiHintModule,
  TuiHostedDropdownModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { PageNavigationComponent } from './components/page-navigation/page-navigation.component';
import { ShieldedTokensListComponent } from './components/shielded-tokens-list/shielded-tokens-list.component';
import { ShieldedTokensListElementComponent } from './components/shielded-tokens-list/components/shielded-tokens-list-element/shielded-tokens-list-element.component';
import { DropdownOptionsShieldedTokenComponent } from './components/shielded-tokens-list/components/dropdown-options-shielded-token/dropdown-options-shielded-token.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiActiveZoneModule } from '@taiga-ui/cdk';
import { PasswordVerificationModalComponent } from './components/password-verification-modal/password-verification-modal.component';
import { TuiInputModule } from '@taiga-ui/kit';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    TuiButtonModule,
    TuiScrollbarModule,
    TuiHostedDropdownModule,
    TuiDataListModule,
    InlineSVGModule,
    TuiHintModule,
    TuiActiveZoneModule,
    TuiInputModule,
    ReactiveFormsModule,
    TuiTextfieldControllerModule
  ],
  declarations: [
    PageNavigationComponent,
    ShieldedTokensListComponent,
    ShieldedTokensListElementComponent,
    DropdownOptionsShieldedTokenComponent,
    PasswordVerificationModalComponent
  ],
  exports: [
    PageNavigationComponent,
    ShieldedTokensListComponent,
    PasswordVerificationModalComponent
  ]
})
export class PrivacySharedModule {}
