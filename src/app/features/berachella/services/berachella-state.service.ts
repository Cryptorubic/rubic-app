import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatestWith, filter, map, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, distinctUntilChanged, Observable, of, shareReplay } from 'rxjs';
import { CHAIN_TYPE } from 'rubic-sdk';
import { AuthService } from '@core/services/auth/auth.service';
import { BerachellaNotificationService } from '@features/berachella/services/berachella-notification.service';
import { BerachellaApiService } from '@features/berachella/services/berachella-api.service';
import { shareReplayConfig } from '@shared/constants/common/share-replay-config';
import { UserInterface } from '@core/services/auth/models/user.interface';

@Injectable()
export class BerachellaStateService {
  private readonly _sessionDiscordConnect$ = new BehaviorSubject<boolean>(false);

  public readonly sessionDiscordConnect$ = this._sessionDiscordConnect$.asObservable();

  private readonly _discordLoading$ = new BehaviorSubject<boolean>(true);

  public readonly discordLoading$ = this._discordLoading$
    .asObservable()
    .pipe(shareReplay(shareReplayConfig));

  private readonly _sessionSubmittedTickets$ = new BehaviorSubject<Record<string, number> | null>(
    {}
  );

  public readonly sessionSubmittedTickets$ = this._sessionSubmittedTickets$.asObservable();

  public readonly currentUser$ = this.authService.currentUser$.pipe(
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

  public readonly discordConnected$ = this.currentUser$.pipe(
    filter((el: UserInterface) => Boolean(el?.address)),
    combineLatestWith(this.sessionDiscordConnect$),
    switchMap(([user, isConnected]: [UserInterface, boolean]) =>
      isConnected ? of(true) : this.apiService.checkDiscordConnection(user?.address || '')
    ),
    tap(() => {
      this._discordLoading$.next(false);
    }),
    startWith(false)
  );

  public readonly ticketsForm = new FormGroup({
    tickets: new FormControl(null)
  });

  public readonly isValid$: Observable<boolean> = this.ticketsForm.valueChanges.pipe(
    map(() => this.ticketsForm.valid && this.ticketsForm.controls.tickets.value),
    startWith(false)
  );

  public readonly userTickets$: Observable<null | number> = this.currentUser$.pipe(
    combineLatestWith(this.sessionSubmittedTickets$),
    switchMap(([user, submittedTickets]) => {
      if (!user?.address) {
        return of(null);
      } else {
        const userSubmittedTickets = submittedTickets?.[user.address] || 0;
        return this.apiService
          .fetchUserTickets(user.address)
          .pipe(
            map(el =>
              Math.max(
                0,
                el.totalBerachellaTickets - el.totalSubmittedTickets - userSubmittedTickets
              )
            )
          );
      }
    }),
    startWith(null),
    shareReplay(shareReplayConfig)
  );

  private readonly allSubmittedTickets$: Observable<null | number> = this.apiService
    .fetchStats()
    .pipe(
      map(el => (el ? el.totalSubmittedTickets : null)),
      startWith(null),
      shareReplay(shareReplayConfig)
    );

  public readonly winChances$: Observable<null | number> = this.allSubmittedTickets$.pipe(
    combineLatestWith(this.ticketsForm.controls.tickets.valueChanges, this.currentUser$),
    map(([userTickets, selectedTickets, user]) => {
      if (
        userTickets === null ||
        selectedTickets === null ||
        selectedTickets === 0 ||
        !user?.address
      ) {
        return null;
      }
      const chance = (selectedTickets / userTickets) * 100;
      const roundedChance = Math.round(chance * 100) / 100;
      return Math.min(100, roundedChance);
    })
  );

  public readonly userMessage$: Observable<string> = this.currentUser$.pipe(
    switchMap(user => {
      if (!user?.address || !(this.ticketsForm.valid && this.ticketsForm.controls.tickets.value)) {
        return of(null);
      }
      return this.apiService
        .fetchMessage({
          userAddress: user.address,
          value: this.ticketsForm.controls.tickets.value
        })
        .pipe(map(el => el.message));
    })
  );

  constructor(
    private readonly authService: AuthService,
    private readonly apiService: BerachellaApiService,
    private readonly notificationService: BerachellaNotificationService
  ) {}

  public submitTicketsAmount(): void {
    const address = this.authService.user.address;
    const tickets = this.ticketsForm.controls.tickets.value;
    const oldAmount = this._sessionSubmittedTickets$.value?.[address] || 0;
    this._sessionSubmittedTickets$.next({
      ...this._sessionSubmittedTickets$.value,
      [address]: oldAmount + tickets
    });
  }

  public conenctDistord(): void {
    this._sessionDiscordConnect$.next(true);
  }
}
