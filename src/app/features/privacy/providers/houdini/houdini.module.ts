import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HoudiniRoutingModule } from './houdini-routing.module';
import { HoudiniMainPageComponent } from './components/houdini-main-page/houdini-main-page.component';

@NgModule({
  declarations: [HoudiniMainPageComponent],
  imports: [CommonModule, HoudiniRoutingModule]
})
export class HoudiniModule {}
