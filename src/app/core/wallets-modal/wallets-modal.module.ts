import { TuiCheckbox } from '@taiga-ui/kit';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TuiScrollbar, TuiScrollable, TuiButton } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewWalletsModalComponent } from './components/new-wallets-modal/new-wallets-modal.component';
import { ChainTypesListComponent } from './components/new-wallets-modal/components/chain-types-list/chain-types-list.component';
import { WalletsListComponent } from './components/new-wallets-modal/components/wallets-list/wallets-list.component';
import { MultichainWalletModalComponent } from '@shared/components/multichain-wallet-modal/multichain-wallet-modal.component';

@NgModule({
  declarations: [
    WalletsModalComponent,
    CoinbaseConfirmModalComponent,
    NewWalletsModalComponent,
    ChainTypesListComponent,
    WalletsListComponent,
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
