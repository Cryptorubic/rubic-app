import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivacyCashRoutingModule } from './privacy-cash-routing.module';
import { PrivacyCashViewComponent } from './components/privacy-cash-view/privacy-cash-view.component';

@NgModule({
  declarations: [PrivacyCashViewComponent],
  imports: [CommonModule, PrivacyCashRoutingModule]
})
export class PrivacyCashModule {}
