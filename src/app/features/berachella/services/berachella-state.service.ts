import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatestWith, map, startWith, switchMap } from 'rxjs/operators';
import { distinctUntilChanged, Observable, of, shareReplay } from 'rxjs';
import { CHAIN_TYPE } from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { BerachellaNotificationService } from '@features/berachella/services/berachella-notification.service';
import { BerachellaApiService } from '@features/berachella/services/berachella-api.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';

@Injectable()
export class BerachellaStateService {
  private readonly currentUser$ = this.authService.currentUser$.pipe(
    distinctUntilChanged((prev, curr) => prev?.address === curr?.address),
    map(user => {
      if (user?.chainType === CHAIN_TYPE.EVM) {
        return user;
      }
      if (user?.address) {
        this.notificationService.showWrongWalletNotification();
      }

      return { ...user, address: '' };
    })
  );

  public readonly ticketsForm = new FormGroup({
    tickets: new FormControl(null)
  });

  public readonly isValid$: Observable<boolean> = this.ticketsForm.valueChanges.pipe(
    map(() => this.ticketsForm.valid && this.ticketsForm.controls.tickets.value),
    startWith(false)
  );

  public readonly userTickets$: Observable<null | number> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user?.address) {
        return of(null);
      } else {
        return this.apiService
          .fetchUserTickets(user.address)
          .pipe(map(el => Math.max(0, el.totalBerachellaTickets - el.totalSubmittedTickets)));
      }
    }),
    startWith(null),
    shareReplay(shareReplayConfig)
  );

  private readonly allTickets$: Observable<null | number> = this.apiService.fetchStats().pipe(
    map(el => (el ? el.totalBerachellaTickets : null)),
    startWith(null),
    shareReplay(shareReplayConfig)
  );

  public readonly winChances$: Observable<null | number> = this.userTickets$.pipe(
    combineLatestWith(this.ticketsForm.controls.tickets.valueChanges),
    map(([userTickets, selectedTickets]) => {
      if (userTickets === null || selectedTickets === null || selectedTickets === 0) {
        return null;
      }
      const chance = (userTickets / selectedTickets) * 100;
      return Math.round(chance * 100) / 100;
    })
  );

  public readonly userMessage$: Observable<string> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user?.address || !(this.ticketsForm.valid && this.ticketsForm.controls.tickets.value)) {
        return of(null);
      }
      return this.apiService
        .fetchMessage({
          userAddress: '0x4f0591ad9662ccd4281f038f1e426d4b56de9004',
          value: this.ticketsForm.controls.tickets.value
        })
        .pipe(map(el => el.message));
    })
  );

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: BerachellaApiService,
    private readonly notificationService: BerachellaNotificationService
  ) {
    this.userMessage$.subscribe(console.log);
  }
}
