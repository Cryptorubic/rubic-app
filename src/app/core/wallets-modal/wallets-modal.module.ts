import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { CoinbaseConfirmModalComponent } from 'src/app/core/wallets-modal/components/coinbase-confirm-modal/coinbase-confirm-modal.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { TuiButtonModule, TuiScrollbarModule } from '@taiga-ui/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiCheckboxModule } from '@taiga-ui/kit';
import { MetamaskModalComponent } from '@shared/components/metamask-modal/metamask-modal.component';
import { NewWalletsModalComponent } from './components/new-wallets-modal/new-wallets-modal.component';
import { ChainTypesListComponent } from './components/new-wallets-modal/components/chain-types-list/chain-types-list.component';
import { WalletsListComponent } from './components/new-wallets-modal/components/wallets-list/wallets-list.component';

@NgModule({
  declarations: [
    WalletsModalComponent,
    CoinbaseConfirmModalComponent,
    MetamaskModalComponent,
    NewWalletsModalComponent,
    ChainTypesListComponent,
    WalletsListComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TuiScrollbarModule,
    TuiButtonModule,
    FormsModule,
    TuiCheckboxModule,
    ReactiveFormsModule
  ],
  providers: []
})
export class WalletsModalModule {}
