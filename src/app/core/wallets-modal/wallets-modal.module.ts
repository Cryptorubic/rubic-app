import { TuiCheckbox } from '@taiga-ui/kit';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TuiScrollbar, TuiScrollable, TuiButton } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultichainWalletModalComponent } from '@shared/components/multichain-wallet-modal/multichain-wallet-modal.component';

@NgModule({
  declarations: [
    WalletsModalComponent,
    CoinbaseConfirmModalComponent,
    MultichainWalletModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbar,
    TuiScrollable,
    TuiButton,
    FormsModule,
    TuiCheckbox,
    ReactiveFormsModule
  ],
  providers: []
})
export class WalletsModalModule {}
