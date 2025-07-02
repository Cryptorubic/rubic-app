import { NgModule } from '@angular/core';
import { BerachellaComponent } from '@features/berachella/components/berachella-page/berachella.component';
import { BerachellaRoutingModule } from '@features/berachella/berachella-routing.module';
import { SharedModule } from '@shared/shared.module';
import { BerachellaWalletButtonComponent } from './components/berachella-wallet-button/berachella-wallet-button.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  TuiButtonModule,
  TuiHintModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule
} from '@taiga-ui/core';
import { BerachellaTicketsInputComponent } from './components/berachella-tickets-input/berachella-tickets-input.component';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiInputNumberModule } from '@taiga-ui/kit';
import { BerachellaTicketsButtonComponent } from './components/berachella-tickets-button/berachella-tickets-button.component';
import { BerachellaTicketsInfoComponent } from './components/berachella-tickets-info/berachella-tickets-info.component';
import { BerachellaWinningChancesComponent } from './components/berachella-winning-chances/berachella-winning-chances.component';
import { BerachellaApiService } from '@features/berachella/services/berachella-api.service';
import { BerachellaNotificationService } from '@features/berachella/services/berachella-notification.service';
import { BerachellaActionService } from '@features/berachella/services/berachella-action.service';
import { BerachellaDiscordComponent } from './components/berachella-discord/berachella-discord.component';

@NgModule({
  declarations: [
    BerachellaComponent,
    BerachellaWalletButtonComponent,
    BerachellaTicketsInputComponent,
    BerachellaTicketsButtonComponent,
    BerachellaTicketsInfoComponent,
    BerachellaWinningChancesComponent,
    BerachellaDiscordComponent
  ],
  imports: [
    BerachellaRoutingModule,
    SharedModule,
    AsyncPipe,
    InlineSVGModule,
    TuiButtonModule,
    NgIf,
    ReactiveFormsModule,
    TuiInputNumberModule,
    TuiTextfieldControllerModule,
    TuiHintModule,
    TuiLoaderModule
  ],
  providers: [
    BerachellaStateService,
    BerachellaApiService,
    BerachellaNotificationService,
    BerachellaActionService
  ]
})
export class BerachellaModule {}
