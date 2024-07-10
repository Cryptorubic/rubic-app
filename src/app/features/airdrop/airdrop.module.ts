import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { PointsContainerComponent } from './components/points-container/points-container.component';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiScrollbarModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';
import { TuiInputModule } from '@taiga-ui/kit';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { ClaimPopupService } from '@shared/services/claim-services/claim-popup.service';
import { ClaimWeb3Service } from '@shared/services/claim-services/claim-web3.service';
import { ClaimContainerComponent } from '@features/airdrop/components/claim-container/claim-container.component';
import { AirdropRoutingModule } from '@features/airdrop/airdrop-routing.module';
import { AirdropPageComponent } from '@features/airdrop/components/airdrop-page/airdrop-page.component';
import { AirdropFaqComponent } from '@features/airdrop/components/airdrop-faq/airdrop-faq.component';
import { TranslateModule } from '@ngx-translate/core';
import { AirdropApiService } from '@features/airdrop/services/airdrop-api.service';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

@NgModule({
  declarations: [
    AirdropPageComponent,
    AirdropFaqComponent,
    PointsContainerComponent,
    ClaimContainerComponent,
    SuccessClaimModalComponent
  ],
  imports: [
    TranslateModule,
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
  providers: [ClaimPopupService, ClaimWeb3Service, AirdropApiService, AirdropService]
})
export class AirdropModule {}
