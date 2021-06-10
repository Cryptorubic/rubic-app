import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { BridgeBottomFormComponent } from './components/bridge-bottom-form/bridge-bottom-form.component';

@NgModule({
  declarations: [BridgeBottomFormComponent],
  exports: [BridgeBottomFormComponent],
  imports: [CommonModule, SharedModule]
})
export class BridgeModule {}
