import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { BridgePageRoutingModule } from './bridge-page-routing.module';
import { BridgeComponent } from './components/bridge/bridge.component';
import { BridgeInProgressModalComponent } from './components/bridge-in-progress-modal/bridge-in-progress-modal.component';
import { BridgeSuccessComponent } from './components/bridge-success/bridge-success.component';
import { BridgeTableComponent } from './components/bridge-table/bridge-table.component';
import { BridgeFormComponent } from './components/brifge-form/bridge-form.component';
import { NetworkErrorComponent } from './components/network-error/network-error.component';
import { BridgeService } from './services/bridge.service';

@NgModule({
  declarations: [
    BridgeFormComponent,
    BridgeComponent,
    BridgeInProgressModalComponent,
    BridgeSuccessComponent,
    BridgeTableComponent,
    NetworkErrorComponent
  ],
  imports: [CommonModule, BridgePageRoutingModule, SharedModule, TranslateModule],
  providers: [BridgeService]
})
export class BridgePageModule {}
