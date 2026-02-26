import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrivacyRoutingModule } from '@features/privacy/privacy-routing.module';
import { PrivacyMainPageComponent } from '@features/privacy/components/privacy-main-page/privacy-main-page.component';
import { TuiIslandModule } from '@taiga-ui/kit';

@NgModule({
  declarations: [PrivacyMainPageComponent],
  imports: [CommonModule, PrivacyRoutingModule, TuiIslandModule],
  providers: []
})
export class PrivacyModule {}
