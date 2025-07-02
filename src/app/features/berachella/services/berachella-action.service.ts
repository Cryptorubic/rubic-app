import { Injectable } from '@angular/core';
import { BerachellaStateService } from '@features/berachella/services/berachella-state.service';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';
import { CHAIN_TYPE, Injector } from 'rubic-sdk';
import { BerachellaApiService } from '@features/berachella/services/berachella-api.service';
import { BerachellaNotificationService } from '@features/berachella/services/berachella-notification.service';
import { BerachellaButtonState } from '@features/berachella/interfaces/berachella-state.interface';
import { map } from 'rxjs/operators';

@Injectable()
export class BerachellaActionService {
  private readonly _buttonStatus$ = new BehaviorSubject<BerachellaButtonState>('active');

  public readonly buttonState$ = this._buttonStatus$.asObservable();

  constructor(
    private readonly stateService: BerachellaStateService,
    private readonly apiService: BerachellaApiService,
    private readonly notificationService: BerachellaNotificationService
  ) {}

  public async signMessage(): Promise<void> {
    let claimInProgressNotification: Subscription;
    try {
      this._buttonStatus$.next('loading');

      claimInProgressNotification = this.notificationService.showProgressNotification();
      const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);
      const message = await firstValueFrom(this.stateService.userMessage$);

      const signature = await web3.signMessage(message);
      const { valid } = await firstValueFrom(
        this.apiService.verifySignature({ message, signature })
      );
      if (!valid) {
        throw new Error('Invalid signature');
      }
      this.notificationService.showSuccessNotification();
      this.stateService.submitTicketsAmount();
    } catch (error) {
      this.notificationService.showErrorNotification(error);
    } finally {
      claimInProgressNotification?.unsubscribe();
      this._buttonStatus$.next('active');
    }
  }

  public async signWallet(code: string): Promise<void> {
    // let claimInProgressNotification: Subscription;
    try {
      // this._buttonStatus$.next('loading');
      //
      // claimInProgressNotification = this.notificationService.showProgressNotification();
      const web3 = Injector.web3PrivateService.getWeb3Private(CHAIN_TYPE.EVM);

      const signature = await web3.signMessage(code);
      const address = await firstValueFrom(
        this.stateService.currentUser$.pipe(map(el => el.address))
      );
      const { valid } = await firstValueFrom(
        this.apiService.sendDiscordInfo({ message: code, signature, address })
      );
      if (!valid) {
        throw new Error('Invalid signature');
      }
      // this.notificationService.showSuccessNotification();
      // this.stateService.submitTicketsAmount();
      // this.stateService.
    } catch (error) {
      // this.notificationService.showErrorNotification(error);
    } finally {
      // claimInProgressNotification?.unsubscribe();
      // this._buttonStatus$.next('active');
    }
  }
}
