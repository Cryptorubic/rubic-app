import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ZamaRoutingModule } from './zama-routing.module';
import { ZamaViewComponent } from './components/zama-view/zama-view.component';

@NgModule({
  declarations: [ZamaViewComponent],
  imports: [CommonModule, ZamaRoutingModule]
})
export class ZamaModule {}
