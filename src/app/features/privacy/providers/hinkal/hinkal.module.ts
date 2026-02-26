import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HinkalRoutingModule } from './hinkal-routing.module';
import { HinkalViewComponent } from './components/hinkal-view/hinkal-view.component';

@NgModule({
  declarations: [HinkalViewComponent],
  imports: [CommonModule, HinkalRoutingModule]
})
export class HinkalModule {}
