import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { FaqComponent } from './components/faq-component/faq.component';
import { FaqPageRoutingModule } from './faq-page-routing.module';

@NgModule({
  declarations: [FaqComponent],
  imports: [FaqPageRoutingModule, CommonModule, SharedModule, TranslateModule]
})
export class FaqPageModule {}
