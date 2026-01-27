import { PrivacyMainPageComponent } from '@features/privacy/components/privacy-main-page/privacy-main-page.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrivacyRoutingModule } from '@features/privacy/privacy-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [PrivacyMainPageComponent],
  imports: [CommonModule, PrivacyRoutingModule, SharedModule],
  providers: []
})
export class PrivacyModule {}
