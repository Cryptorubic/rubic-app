import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalService } from 'src/app/core/wallets-modal/services/wallets-modal.service';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TuiButtonModule, TuiScrollbarModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiCheckboxModule } from '@taiga-ui/kit';

@NgModule({
  declarations: [WalletsModalComponent, CoinbaseConfirmModalComponent],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiButtonModule,
    FormsModule,
    TuiCheckboxModule,
    ReactiveFormsModule
  ],
  providers: [WalletsModalService]
})
export class WalletsModalModule {}
