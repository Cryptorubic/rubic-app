import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ApproveScannerService } from '@features/approve-scanner/services/approve-scanner.service';
import { PointsContainerComponent } from './components/points-container/points-container.component';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { DifferentAddressesModalComponent } from '@features/airdrop/components/different-addresses-modal/different-addresses-modal.component';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { AirdropPopupService } from '@features/airdrop/services/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/airdrop/services/airdrop-web3.service';
import { ClaimContainerComponent } from '@features/airdrop/components/claim-container/claim-container.component';
import { RoundRowContainerComponent } from '@features/airdrop/components/round-row/round-row-container.component';
import { AirdropRoutingModule } from '@features/airdrop/airdrop-routing.module';
import { AirdropPageComponent } from '@features/airdrop/components/airdrop-page/airdrop-page.component';
import { AirdropFaqComponent } from '@features/airdrop/components/airdrop-faq/airdrop-faq.component';

@NgModule({
  declarations: [
    AirdropPageComponent,
    AirdropFaqComponent,
    PointsContainerComponent,
    RoundRowContainerComponent,
    ClaimContainerComponent,
    DifferentAddressesModalComponent,
    SuccessClaimModalComponent
  ],
  imports: [
    CommonModule,
    AirdropRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    TuiHintModule,
    TuiInputModule,
    InlineSVGModule,
    TuiTextfieldControllerModule,
    TuiScrollbarModule,
    TuiLoaderModule,
    TuiButtonModule
  ],
  providers: [ApproveScannerService, AirdropPopupService, AirdropWeb3Service]
})
export class AirdropModule {}
