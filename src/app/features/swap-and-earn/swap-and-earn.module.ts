import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { SwapAndEarnPageComponent } from './components/swap-and-earn-page/swap-and-earn-page.component';
import { SwapAndEarnRoutingModule } from '@features/swap-and-earn/swap-and-earn-routing.module';
import { SwapAndEarnFaqComponent } from './components/swap-and-earn-faq/swap-and-earn-faq.component';
import { PointsContainerComponent } from './components/points-container/points-container.component';
import {
  TuiHintModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { DifferentAddressesModalComponent } from '@features/swap-and-earn/components/different-addresses-modal/different-addresses-modal.component';
import { SuccessClaimModalComponent } from '@features/swap-and-earn/components/success-claim-modal/success-claim-modal.component';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SwapAndEarnPopupService } from '@features/swap-and-earn/services/swap-and-earn-popup.service';
import { SwapAndEarnWeb3Service } from '@features/swap-and-earn/services/swap-and-earn-web3.service';
import { ClaimContainerComponent } from '@features/swap-and-earn/components/claim-container/claim-container.component';
import { RetrodropContainerComponent } from 'src/app/features/swap-and-earn/components/retrodrop-container/retrodrop-container.component';
import { RoundRowContainerComponent } from '@features/swap-and-earn/components/round-row/round-row-container.component';
import { SwapAndEarnFacadeService } from '@features/swap-and-earn/services/swap-and-earn-facade.service';
import { RetrodropStakeModalComponent } from 'src/app/features/swap-and-earn/components/retrodrop-stake-modal/retrodrop-stake-modal.component';
import { SwapAndEarnMerkleService } from '@features/swap-and-earn/services/swap-and-earn-merkle.service';
import { SwapAndEarnApiService } from '@features/swap-and-earn/services/swap-and-earn-api.service';

@NgModule({
  declarations: [
    SwapAndEarnPageComponent,
    SwapAndEarnFaqComponent,
    PointsContainerComponent,
    RoundRowContainerComponent,
    ClaimContainerComponent,
    DifferentAddressesModalComponent,
    SuccessClaimModalComponent,
    RetrodropStakeModalComponent,
    RetrodropContainerComponent,
    RetrodropStakeModalComponent
  ],
  imports: [
    CommonModule,
    SwapAndEarnRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TuiHintModule,
    TuiInputModule,
    InlineSVGModule,
    TuiTextfieldControllerModule,
    TuiScrollbarModule,
    TuiLoaderModule
  ],
  providers: [
    ApproveScannerService,
    SwapAndEarnPopupService,
    SwapAndEarnWeb3Service,
    SwapAndEarnFacadeService,
    SwapAndEarnMerkleService,
    SwapAndEarnApiService
  ]
})
export class SwapAndEarnModule {}
