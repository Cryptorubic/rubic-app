import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { SwapAndEarnPageComponent } from './components/swap-and-earn-page/swap-and-earn-page.component';
import { SwapAndEarnRoutingModule } from '@features/swap-and-earn/swap-and-earn-routing.module';
import { SwapAndEarnFaqComponent } from './components/swap-and-earn-faq/swap-and-earn-faq.component';
import { PointsContainerComponent } from './components/points-container/points-container.component';
import { TuiHintModule, TuiScrollbarModule, TuiTextfieldControllerModule } from '@taiga-ui/core';
import { DifferentAddressesModalComponent } from '@features/swap-and-earn/components/different-addresses-modal/different-addresses-modal.component';
import { SuccessClaimModalComponent } from '@features/swap-and-earn/components/success-claim-modal/success-claim-modal.component';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { AirdropFacadeService } from '@features/swap-and-earn/services/airdrop/airdrop-facade.service';
import { AirdropPopupService } from '@features/swap-and-earn/services/airdrop/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/swap-and-earn/services/airdrop/airdrop-web3.service';
import { AirdropMerkleService } from '@features/swap-and-earn/services/airdrop/airdrop-merkle.service';
import { ClaimContainerComponent } from '@features/swap-and-earn/components/claim-container/claim-container.component';
import { RetrodropContainerComponent } from './components/retrodrop-container/retrodrop-container/retrodrop-container.component';
import { RoundRowContainerComponent } from '@features/swap-and-earn/components/round-row/round-row-container.component';

@NgModule({
  declarations: [
    SwapAndEarnPageComponent,
    SwapAndEarnFaqComponent,
    PointsContainerComponent,
    RoundRowContainerComponent,
    ClaimContainerComponent,
    DifferentAddressesModalComponent,
    SuccessClaimModalComponent,
    RetrodropContainerComponent
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
    TuiScrollbarModule
  ],
  providers: [
    ApproveScannerService,
    AirdropFacadeService,
    AirdropPopupService,
    AirdropWeb3Service,
    AirdropMerkleService
  ]
})
export class SwapAndEarnModule {}
