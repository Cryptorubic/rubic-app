import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqRoutingModule } from './faq-routing.module';
import { FaqViewComponent } from './components/faq-view/faq-view.component';
import { SharedModule } from '@app/shared/shared.module';
import { FaqListItemComponent } from './components/faq-list-item/faq-list-item.component';
import { TuiButtonModule } from '@taiga-ui/core';

@NgModule({
  declarations: [FaqViewComponent, FaqListItemComponent],
  imports: [CommonModule, FaqRoutingModule, SharedModule, TuiButtonModule]
})
export class FaqModule {}
