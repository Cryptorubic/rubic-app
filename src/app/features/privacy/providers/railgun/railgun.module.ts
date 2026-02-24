import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RailgunRoutingModule } from './railgun-routing.module';
import { RailgunViewComponent } from './components/railgun-view/railgun-view.component';

@NgModule({
  declarations: [RailgunViewComponent],
  imports: [CommonModule, RailgunRoutingModule]
})
export class RailgunModule {}
