import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '@shared/shared.module';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { SwapAndEarnPageComponent } from './components/swap-and-earn-page/swap-and-earn-page.component';
import { SwapAndEarnRoutingModule } from '@features/swap-and-earn/swap-and-earn-routing.module';
import { SwapAndEarnFaqComponent } from './components/swap-and-earn-faq/swap-and-earn-faq.component';
import { PointsContainerComponent } from './components/points-container/points-container.component';
import { TuiHintModule } from '@taiga-ui/core';

@NgModule({
  declarations: [SwapAndEarnPageComponent, SwapAndEarnFaqComponent, PointsContainerComponent],
  imports: [
    CommonModule,
    SwapAndEarnRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TuiHintModule
  ],
  providers: [ApproveScannerService]
})
export class SwapAndEarnModule {}
